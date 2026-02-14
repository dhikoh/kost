
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../../modules/subscription/subscription.service';

@Injectable()
export class PlanLimitGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private subscriptionService: SubscriptionService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const resourceLimit = this.reflector.get<string>('checkLimit', context.getHandler());
        if (!resourceLimit) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.tenantId) return true; // Skip if no tenant context (e.g. Superadmin or public)

        try {
            await this.subscriptionService.checkLimit(user.tenantId, resourceLimit as 'maxRooms' | 'maxStaff' | 'maxKosts');
            return true;
        } catch (error: any) {
            throw new ForbiddenException(error.message);
        }
    }
}
