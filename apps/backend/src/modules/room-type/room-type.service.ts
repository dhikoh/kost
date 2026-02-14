import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, RoomType } from '@repo/database';

@Injectable()
export class RoomTypeService {
    async create(tenantId: string, data: any): Promise<RoomType> {
        return prisma.roomType.create({
            data: {
                ...data,
                tenantId, // Force tenantId
            },
        });
    }

    async findAll(tenantId: string): Promise<RoomType[]> {
        return prisma.roomType.findMany({
            where: { tenantId }
        });
    }

    async findOne(tenantId: string, id: string): Promise<RoomType | null> {
        const roomType = await prisma.roomType.findFirst({
            where: { id, tenantId },
            include: {
                rooms: true
            }
        });
        if (!roomType) throw new NotFoundException('Room Type not found');
        return roomType;
    }

    async update(tenantId: string, id: string, data: any): Promise<RoomType> {
        const existing = await this.findOne(tenantId, id);
        return prisma.roomType.update({
            where: { id: existing.id },
            data,
        });
    }

    async remove(tenantId: string, id: string): Promise<RoomType> {
        const existing = await this.findOne(tenantId, id);
        return prisma.roomType.delete({
            where: { id: existing.id },
        });
    }
}
