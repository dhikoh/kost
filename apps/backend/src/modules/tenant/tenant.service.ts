import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { prisma, Tenant } from '@repo/database';

@Injectable()
export class TenantService {
    async create(data: any): Promise<Tenant> {
        // Basic slug generation
        const slug = data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // Check slug uniqueness
        const existing = await prisma.tenant.findUnique({ where: { slug } });
        if (existing) {
            throw new ConflictException('Tenant slug already exists');
        }

        // Logic to create tenant with initial admin user
        // This usually should be a transaction: Create Tenant -> Create User -> Create Subscription
        // Simplified for now based on current schema
        return prisma.tenant.create({
            data: {
                name: data.name,
                slug,
                address: data.address,
                phone: data.phone,
                subscription: {
                    create: {
                        plan: { connect: { id: data.planId } },
                        status: 'TRIAL',
                        startDate: new Date(),
                        endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days trial
                    }
                }
            },
        });
    }

    async findAll() {
        return prisma.tenant.findMany({
            include: {
                subscription: {
                    include: { plan: true }
                },
                users: {
                    take: 1 // Get generic owner info
                },
                _count: {
                    select: { rooms: true, bookings: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        return prisma.tenant.findUnique({
            where: { id },
            include: { subscription: { include: { plan: true } } }
        });
    }

    async updateStatus(id: string, isActive: boolean) {
        return prisma.tenant.update({
            where: { id },
            data: { isActive }
        });
    }

    async delete(id: string) {
        return prisma.tenant.delete({ where: { id } });
    }
    async updateProfile(id: string, data: { name?: string; address?: string; phone?: string; description?: string }) {
        return prisma.tenant.update({
            where: { id },
            data,
        });
    }
}
