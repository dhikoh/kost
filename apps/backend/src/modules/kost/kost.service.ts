import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, Kost } from '@repo/database';

@Injectable()
export class KostService {
    async create(tenantId: string, data: any): Promise<Kost> {
        return prisma.kost.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string): Promise<Kost[]> {
        return prisma.kost.findMany({
            where: { tenantId },
            include: { _count: { select: { rooms: true } } }
        });
    }

    async findOne(tenantId: string, id: string): Promise<Kost | null> {
        const kost = await prisma.kost.findFirst({
            where: { id, tenantId },
            include: {
                rooms: true,

            }
        });
        if (!kost) throw new NotFoundException('Kost not found');
        return kost;
    }

    async update(tenantId: string, id: string, data: any): Promise<Kost> {
        const existing = await this.findOne(tenantId, id); // Ensure ownership
        return prisma.kost.update({
            where: { id: existing.id },
            data,
        });
    }

    async remove(tenantId: string, id: string): Promise<Kost> {
        const existing = await this.findOne(tenantId, id);
        return prisma.kost.delete({
            where: { id: existing.id },
        });
    }
}
