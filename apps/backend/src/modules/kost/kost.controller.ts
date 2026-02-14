import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { KostService } from './kost.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

import { PlanLimitGuard } from '../../common/guards/plan-limit.guard';
import { CheckLimit } from '../../common/decorators/check-limit.decorator';

@Controller('kosts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KostController {
    constructor(private readonly kostService: KostService) { }

    @Post()
    @Roles('TENANT', 'SUPERADMIN')
    @UseGuards(PlanLimitGuard)
    @CheckLimit('maxKosts')
    create(@Request() req, @Body() createKostDto: any) {
        const tenantId = req.user.tenantId;
        return this.kostService.create(tenantId, createKostDto);
    }

    @Get()
    @Roles('TENANT', 'SUPERADMIN', 'TENANT_STAFF')
    findAll(@Request() req) {
        const tenantId = req.user.tenantId;
        return this.kostService.findAll(tenantId);
    }

    @Get(':id')
    @Roles('TENANT', 'SUPERADMIN', 'TENANT_STAFF')
    findOne(@Request() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.kostService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('TENANT', 'SUPERADMIN')
    update(@Request() req, @Param('id') id: string, @Body() updateKostDto: any) {
        const tenantId = req.user.tenantId;
        return this.kostService.update(tenantId, id, updateKostDto);
    }

    @Delete(':id')
    @Roles('TENANT', 'SUPERADMIN')
    remove(@Request() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.kostService.remove(tenantId, id);
    }
}
