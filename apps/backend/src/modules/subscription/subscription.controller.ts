
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    @Get('current')
    @Roles('OWNER', 'super_admin') // Only Owner or Admin can see plan details
    async getCurrentPlan(@Request() req) {
        return this.subscriptionService.getCurrentPlan(req.user.tenantId);
    }

    @Post('upgrade')
    @Roles('OWNER')
    async upgradePlan(@Request() req, @Body('planName') planName: string) {
        return this.subscriptionService.assignPlan(req.user.tenantId, planName);
    }
}
