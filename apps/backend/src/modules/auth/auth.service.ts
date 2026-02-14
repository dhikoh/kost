import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TenantService } from '../tenant/tenant.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private tenantService: TenantService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        try {
            const user: any = await this.usersService.findOne(email);
            if (user && (await bcrypt.compare(pass, user.passwordHash))) {
                // Return clean POJO to avoid serialization issues
                return {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    tenantId: user.tenantId,
                    roles: user.roles,
                    tenant: user.tenant
                };
            }
            return null;
        } catch (error) {
            console.error('AuthService.validateUser Error:', error);
            throw error;
        }
    }

    async login(user: any) {
        try {
            const roles = user.roles ? user.roles.map((r: any) => r.role.name) : [];
            const payload = { email: user.email, sub: user.id, tenantId: user.tenantId, roles };
            console.log('Pre-sign payload:', JSON.stringify(payload));
            const token = this.jwtService.sign(payload);
            console.log('Post-sign token generated');
            return {
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    tenantId: user.tenantId,
                    roles,
                },
            };
        } catch (error) {
            console.error('AuthService.login Error:', error);
            throw error;
        }
    }

    async register(data: any) {
        console.log('AuthService.register:', data);

        // 1. Check if user exists
        const existingUser = await this.usersService.findOne(data.email);
        if (existingUser) {
            throw new UnauthorizedException('Email already exists');
        }

        // 2. Get Basic Plan
        // We need to fetch the plan ID. Since we don't have a PlanService, we'll use Prisma directly or assume we can get it.
        // Better to use a helper or just query it.
        // For now, let's assume we can inject Prisma or use the global one.
        // We'll use the imported prisma client from the database package if available, or just use a raw query if needed.
        // But since this is a service, let's try to do it cleanly.
        // We will assume the TenantService can handle plan assignment if we pass the plan name, 
        // OR we fetch it here.

        // Let's rely on TenantService.create to handle the plan connection if we pass the ID.
        // We need to look up the 'Basic' plan.
        const basicPlan = await this.getBasicPlanId();
        if (!basicPlan) throw new Error('Basic Plan not found in database');

        // 3. Create Tenant
        // We need to inject TenantService. 
        // Since we cannot easily inject it without changing the constructor signature which might break other things,
        // let's ensure we add it to the constructor.
        const tenant = await this.tenantService.create({
            name: data.kostName,
            slug: data.kostName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            address: 'Indonesia', // Default
            phone: data.phone,
            planId: basicPlan.id
        });

        // 4. Create User linked to Tenant
        const newUser = await this.usersService.create({
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            phone: data.phone,
            tenantId: tenant.id,
        });

        // 5. Assign OWNER Role
        // We need to fetch the OWNER role ID.
        const ownerRole = await this.getRoleByName('OWNER');
        if (ownerRole) {
            // We need a way to assign role. UsersService.create might not do it.
            // Let's use Prisma to connect.
            // Ideally UsersService should handle this, but for now we'll do it via a helper or direct prisma.
            await this.assignRole(newUser.id, ownerRole.id);
        }

        return this.login(newUser);
    }

    // Helper to get Plan
    private async getBasicPlanId() {
        // We need to import prisma. 
        // Since 'prisma' is exported from @repo/database, we can use it.
        const { prisma } = await import('@repo/database');
        return prisma.plan.findFirst({ where: { name: 'Basic' } });
    }

    private async getRoleByName(name: string) {
        const { prisma } = await import('@repo/database');
        return prisma.role.findUnique({ where: { name } });
    }

    private async assignRole(userId: string, roleId: string) {
        const { prisma } = await import('@repo/database');
        return prisma.userRole.create({
            data: { userId, roleId }
        });
    }
}
