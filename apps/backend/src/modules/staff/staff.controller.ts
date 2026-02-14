import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PlanLimitGuard } from '../../common/guards/plan-limit.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CheckLimit } from '../../common/decorators/check-limit.decorator';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Post()
    @Roles('TENANT', 'SUPERADMIN')
    @UseGuards(PlanLimitGuard)
    @CheckLimit('maxStaff')
    create(@Request() req, @Body() createStaffDto: any) {
        const tenantId = req.user.tenantId;
        return this.staffService.create(tenantId, createStaffDto);
    }

    @Get()
    @Roles('TENANT', 'SUPERADMIN')
    findAll(@Request() req) {
        const tenantId = req.user.tenantId;
        return this.staffService.findAll(tenantId);
    }

    @Delete(':id')
    @Roles('TENANT', 'SUPERADMIN')
    remove(@Request() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.staffService.remove(tenantId, id);
    }
}
