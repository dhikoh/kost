import { Injectable } from '@nestjs/common';
import { prisma, Plan } from '@repo/database';

@Injectable()
export class PlanService {
    async create(data: any): Promise<Plan> {
        return prisma.plan.create({ data });
    }

    async findAll(): Promise<Plan[]> {
        return prisma.plan.findMany();
    }

    async findOne(id: string): Promise<Plan | null> {
        return prisma.plan.findUnique({ where: { id } });
    }

    async update(id: string, data: any): Promise<Plan> {
        return prisma.plan.update({ where: { id }, data });
    }

    async remove(id: string): Promise<Plan> {
        return prisma.plan.delete({ where: { id } });
    }
}
