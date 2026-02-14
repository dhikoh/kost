import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PlanFeatureGuard, CheckFeature } from '../../common/guards/plan-feature.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard, TenantGuard, PlanFeatureGuard)
@CheckFeature('allowFinance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Post('expenses')
    createExpense(@Request() req, @Body() body: any) {
        return this.financeService.createExpense(req.user.tenantId, body);
    }

    @Get('expenses')
    findAllExpenses(@Request() req) {
        return this.financeService.findAllExpenses(req.user.tenantId);
    }

    @Get('summary')
    getSummary(@Request() req) {
        return this.financeService.getSummary(req.user.tenantId);
    }
}
