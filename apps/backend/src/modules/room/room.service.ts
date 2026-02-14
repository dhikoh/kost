import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { prisma, Room } from '@repo/database';

@Injectable()
export class RoomService {
    async create(tenantId: string, data: any): Promise<Room> {
        // 1. Validate Kost ownership
        const kost = await prisma.kost.findUnique({ where: { id: data.kostId } });
        if (!kost) throw new NotFoundException('Kost not found');
        if (kost.tenantId !== tenantId) throw new ForbiddenException('Access to this Kost denied');

        // 2. Validate Room Type ownership
        if (data.roomTypeId) {
            const rt = await prisma.roomType.findFirst({ where: { id: data.roomTypeId, tenantId } });
            if (!rt) throw new NotFoundException('Room Type not found or access denied');
        }

        return prisma.room.create({
            data: {
                roomNumber: data.roomNumber,
                price: data.price,
                roomTypeId: data.roomTypeId,
                kostId: data.kostId,
                status: 'AVAILABLE',
                tenantId,
            },
        });
    }

    async findAll(tenantId: string, kostId?: string): Promise<Room[]> {
        return prisma.room.findMany({
            where: {
                tenantId,
                ...(kostId && { kostId }),
            },
            include: {
                kost: { select: { name: true } },
                roomType: { select: { name: true, basePrice: true } } // Changed price to basePrice (from schema)
            }
        });
    }

    async findOne(tenantId: string, id: string): Promise<Room | null> {
        const room = await prisma.room.findFirst({
            where: { id, tenantId },
            include: {
                bookings: { take: 5, orderBy: { createdAt: 'desc' } }
            }
        });
        if (!room) throw new NotFoundException('Room not found');
        return room;
    }

    async update(tenantId: string, id: string, data: any): Promise<Room> {
        const existing = await this.findOne(tenantId, id);
        return prisma.room.update({
            where: { id: existing.id },
            data,
        });
    }

    async remove(tenantId: string, id: string): Promise<Room> {
        const existing = await this.findOne(tenantId, id);
        return prisma.room.delete({
            where: { id: existing.id },
        });
    }
}
