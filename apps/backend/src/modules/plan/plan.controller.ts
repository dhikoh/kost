import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
export class PlanController {
    constructor(private readonly planService: PlanService) { }

    @Post()
    create(@Body() createPlanDto: any) {
        return this.planService.create(createPlanDto);
    }

    @Get()
    findAll() {
        return this.planService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.planService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePlanDto: any) {
        return this.planService.update(id, updatePlanDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.planService.remove(id);
    }
}
