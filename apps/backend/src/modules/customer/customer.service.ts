import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class CustomerService {

    findAll(tenantId: string) {
        return prisma.customer.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string, tenantId: string) {
        return prisma.customer.findFirst({
            where: { id, tenantId },
        });
    }

    create(tenantId: string, data: any) {
        return prisma.customer.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    update(id: string, tenantId: string, data: any) {
        return prisma.customer.updateMany({
            where: { id, tenantId },
            data,
        });
    }

    remove(id: string, tenantId: string) {
        return prisma.customer.deleteMany({
            where: { id, tenantId },
        });
    }
}
