import { Controller, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() body: { fullName?: string; phone?: string; password?: string }) {
        return this.usersService.updateProfile(req.user.id, body);
    }
}
