import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('checkout')
  async checkout(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    return await this.subscriptionsService.checkout(
      createSubscriptionDto,
      req.user.id,
    );
  }

  @Get('my')
  async getMySubscription(@Request() req) {
    return await this.subscriptionsService.getMySubscription(req.user.id);
  }

  @Get('plans')
  async getPlans() {
    return await this.subscriptionsService.getPlans();
  }

  @Delete(':companyId')
  async cancelSubscription(
    @Param('companyId') companyId: string,
    @Request() req,
  ) {
    return await this.subscriptionsService.cancelSubscription(
      parseInt(companyId),
      req.user.id,
    );
  }
}
