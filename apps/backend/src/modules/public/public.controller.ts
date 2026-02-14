import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('public')
@UseGuards(ApiKeyGuard)
export class PublicController {
    constructor(private readonly publicService: PublicService) { }

    @Get(':slug')
    getKost(@Param('slug') slug: string) {
        return this.publicService.getKostBySlug(slug);
    }

    @Get(':slug/rooms')
    getRooms(@Param('slug') slug: string) {
        return this.publicService.getAvailableRooms(slug);
    }
}
