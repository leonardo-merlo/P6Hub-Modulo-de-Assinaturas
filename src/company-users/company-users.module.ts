import { Module } from '@nestjs/common';
import { CompanyUsersService } from './company-users.service';
import { CompanyUsersController } from './company-users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CompanyUsersService],
  controllers: [CompanyUsersController],
  exports: [CompanyUsersService],
})
export class CompanyUsersModule {}
