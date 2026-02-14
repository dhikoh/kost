import { Injectable } from '@nestjs/common';
import { prisma, User } from '@repo/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    async findOne(email: string): Promise<User | null> {
        console.log('UsersService.findOne ENTER:', email);
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    tenant: true,
                    roles: {
                        include: {
                            role: true, // Include Role relation
                        },
                    },
                },
            });
            console.log('UsersService.findOne EXIT: found=', !!user);
            return user;
        } catch (error) {
            console.error('UsersService.findOne Error:', error);
            throw error;
        }
    }

    async updateProfile(id: string, data: { fullName?: string; phone?: string; password?: string }): Promise<User> {
        console.log('UsersService.updateProfile', id, data);
        const updateData: any = {};
        if (data.fullName) updateData.fullName = data.fullName;
        if (data.phone) updateData.phone = data.phone;

        if (data.password) {
            const salt = await bcrypt.genSalt();
            updateData.passwordHash = await bcrypt.hash(data.password, salt);
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    async create(data: any): Promise<User> {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(data.password, salt);

        return prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phone: data.phone,
                tenantId: data.tenantId || null,
                // Roles handling logic can be added here or via separate relation connect
            },
        });
    }
}
