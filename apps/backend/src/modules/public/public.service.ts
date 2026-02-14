import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class PublicService {
    async getKostBySlug(slug: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { slug },
            include: {
                kosts: {
                    include: {
                        rooms: {
                            where: { status: 'AVAILABLE' }
                        }
                    }
                },
                roomTypes: true
            }
        });

        if (!tenant) throw new NotFoundException('Kost not found');
        return tenant;
    }

    async getAvailableRooms(slug: string) {
        const tenant = await prisma.tenant.findUnique({ where: { slug } });
        if (!tenant) throw new NotFoundException('Kost not found');

        return prisma.room.findMany({
            where: {
                tenantId: tenant.id,
                status: 'AVAILABLE'
            },
            include: {
                roomType: true,
                kost: { select: { name: true } }
            }
        });
    }
}
