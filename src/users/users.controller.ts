import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return await this.usersService.findById(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.usersService.findAll();
  }
}
