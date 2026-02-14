
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../../modules/subscription/subscription.service';

export const CheckFeature = (feature: 'allowFinance' | 'allowExport') => SetMetadata('checkFeature', feature);

@Injectable()
export class PlanFeatureGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private subscriptionService: SubscriptionService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const feature = this.reflector.getAllAndOverride<string>('checkFeature', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!feature) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.tenantId) return true;

        try {
            await this.subscriptionService.checkFeature(user.tenantId, feature as 'allowFinance' | 'allowExport');
            return true;
        } catch (error: any) {
            throw new ForbiddenException(error.message);
        }
    }
}
