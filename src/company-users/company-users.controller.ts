import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { CompanyUsersService } from './company-users.service';
import { CreateCompanyUserDto } from './dto/create-company-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('company-users')
@UseGuards(JwtAuthGuard)
export class CompanyUsersController {
  constructor(private companyUsersService: CompanyUsersService) {}

  @Post()
  async create(
    @Body() createCompanyUserDto: CreateCompanyUserDto,
    @Request() req,
  ) {
    return await this.companyUsersService.create(
      createCompanyUserDto,
      req.user.id,
    );
  }

  @Get('company/:companyId')
  async findByCompanyId(@Param('companyId') companyId: string) {
    return await this.companyUsersService.findByCompanyId(parseInt(companyId));
  }

  @Get('me')
  async findByUserId(@Request() req) {
    return await this.companyUsersService.findByUserId(req.user.id);
  }
}
