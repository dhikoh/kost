import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class SubscriptionService {

    async assignPlan(tenantId: string, planName: string) {
        const plan = await prisma.plan.findFirst({ where: { name: planName } });
        if (!plan) throw new NotFoundException(`Plan ${planName} not found`);

        // Deactivate old subscription
        await prisma.subscription.updateMany({
            where: { tenantId, status: 'ACTIVE' },
            data: { status: 'INACTIVE', endDate: new Date() },
        });

        // Create new
        return prisma.subscription.create({
            data: {
                tenantId,
                planId: plan.id,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year default
            },
            include: { plan: true },
        });
    }

    async getCurrentPlan(tenantId: string) {
        const sub = await prisma.subscription.findFirst({
            where: { tenantId, status: 'ACTIVE' },
            include: { plan: true },
        });

        if (!sub) return null; // Or return a default 'Free' plan object if desired

        // Get Usage Stats
        const [roomCount, staffCount] = await Promise.all([
            prisma.room.count({ where: { tenantId } }),
            prisma.user.count({ where: { tenantId, roles: { some: { role: { name: 'STAFF' } } } } }),
        ]);

        return {
            ...sub.plan,
            usage: {
                rooms: roomCount,
                staff: staffCount,
            },
        };
    }

    async checkLimit(tenantId: string, resource: 'maxRooms' | 'maxStaff' | 'maxKosts'): Promise<void> {
        console.log(`checkLimit: tenantId=${tenantId}, resource=${resource}`);
        const subscription = await this.getCurrentPlan(tenantId);
        if (!subscription) throw new ForbiddenException('No active subscription found');

        let limit = 0;
        let count = 0;

        if (resource === 'maxKosts') {
            // maxKosts logic: if allowMultiBranch is true, limit is 100 (unlimited), else 1
            limit = subscription.allowMultiBranch ? 100 : 1;
            count = await prisma.kost.count({ where: { tenantId } });
        } else {
            limit = subscription[resource];
            if (resource === 'maxRooms') {
                count = await prisma.room.count({ where: { tenantId } });
            } else if (resource === 'maxStaff') {
                count = await prisma.user.count({
                    where: {
                        tenantId,
                        roles: { some: { role: { name: 'STAFF' } } }
                    }
                });
            }
        }

        console.log(`checkLimit: resource=${resource}, limit=${limit}, current=${count}`);

        if (count >= limit) {
            console.warn(`checkLimit: Limit reached! ${count} >= ${limit}`);
            throw new ForbiddenException(`Plan limit reached for ${resource} (${limit})`);
        }
    }

    async checkFeature(tenantId: string, feature: 'allowFinance' | 'allowExport'): Promise<void> {
        const subscription = await this.getCurrentPlan(tenantId);
        if (!subscription) throw new ForbiddenException('No active subscription found');

        if (!subscription[feature]) {
            throw new ForbiddenException(`Plan does not support feature: ${feature}`);
        }
    }
}
