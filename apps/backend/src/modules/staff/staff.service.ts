import { Injectable, BadRequestException } from '@nestjs/common';
import { prisma, User } from '@repo/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
    async create(tenantId: string, data: any): Promise<User> {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new BadRequestException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Create user logic directly here or re-use usersService
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phone: data.phone,
                tenantId,
                // Role assignment: TENANT_STAFF
                roles: {
                    create: {
                        role: {
                            connectOrCreate: {
                                where: { name: 'TENANT_STAFF' },
                                create: { name: 'TENANT_STAFF', level: 10 }
                            }
                        }
                    }
                }
            },
        });

        return user;
    }

    async findAll(tenantId: string) {
        return prisma.user.findMany({
            where: {
                tenantId,
                roles: {
                    some: {
                        role: { name: 'TENANT_STAFF' }
                    }
                }
            },
            include: { roles: { include: { role: true } } }
        });
    }

    async remove(tenantId: string, id: string) {
        // Ensure user belongs to tenant and is staff
        return prisma.user.deleteMany({
            where: {
                id,
                tenantId,
                roles: {
                    some: { role: { name: 'TENANT_STAFF' } }
                }
            }
        });
    }
}
