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
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PlanLimitGuard } from '../../common/guards/plan-limit.guard';
import { CheckLimit } from '../../common/decorators/check-limit.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Post()
    @Roles('TENANT', 'SUPERADMIN')
    @UseGuards(PlanLimitGuard)
    @CheckLimit('maxRooms')
    create(@Request() req, @Body() createRoomDto: any) {
        const tenantId = req.user.tenantId;
        return this.roomService.create(tenantId, createRoomDto);
    }

    @Get()
    @Roles('TENANT', 'SUPERADMIN', 'TENANT_STAFF')
    findAll(@Request() req, @Query('kostId') kostId?: string) {
        const tenantId = req.user.tenantId;
        return this.roomService.findAll(tenantId, kostId);
    }

    @Get(':id')
    @Roles('TENANT', 'SUPERADMIN', 'TENANT_STAFF')
    findOne(@Request() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.roomService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('TENANT', 'SUPERADMIN')
    update(@Request() req, @Param('id') id: string, @Body() updateRoomDto: any) {
        const tenantId = req.user.tenantId;
        return this.roomService.update(tenantId, id, updateRoomDto);
    }

    @Delete(':id')
    @Roles('TENANT', 'SUPERADMIN')
    remove(@Request() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.roomService.remove(tenantId, id);
    }
}
