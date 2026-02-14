import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles('SUPERADMIN') // Only superadmin can create tenants initially or public registration endpoint?
    // For SaaS, usually public registration is allowed but might be separate AuthController register
    async create(@Body() createTenantDto: any) {
        return this.tenantService.create(createTenantDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    async findAll() {
        return this.tenantService.findAll();
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    async updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.tenantService.updateStatus(id, isActive);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        // User can see their own tenant profile
        return this.tenantService.findOne(req.user.tenantId);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('OWNER')
    async updateProfile(@Request() req, @Body() body: { name?: string; address?: string; phone?: string; description?: string }) {
        return this.tenantService.updateProfile(req.user.tenantId, body);
    }
}
