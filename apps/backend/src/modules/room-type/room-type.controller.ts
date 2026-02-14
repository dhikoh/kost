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
    Query,
} from '@nestjs/common';
import { RoomTypeService } from './room-type.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('room-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomTypeController {
    constructor(private readonly roomTypeService: RoomTypeService) { }

    @Post()
    @Roles('TENANT', 'SUPERADMIN')
    create(@Request() req, @Body() createRoomTypeDto: any) {
        const tenantId = req.user.tenantId;
        return this.roomTypeService.create(tenantId, createRoomTypeDto);
    }

    @Get()
    @Roles('TENANT', 'SUPERADMIN', 'TENANT_STAFF')
    findAll(@Request() req) {
        const tenantId = req.user.tenantId;
        return this.roomTypeService.findAll(tenantId);
    }

    @Get(':id')
    @Roles('TENANT', 'SUPERADMIN', 'TENANT_STAFF')
    findOne(@Request() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.roomTypeService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('TENANT', 'SUPERADMIN')
    update(@Request() req, @Param('id') id: string, @Body() updateRoomTypeDto: any) {
        const tenantId = req.user.tenantId;
        return this.roomTypeService.update(tenantId, id, updateRoomTypeDto);
    }

    @Delete(':id')
    @Roles('TENANT', 'SUPERADMIN')
    remove(@Request() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.roomTypeService.remove(tenantId, id);
    }
}
