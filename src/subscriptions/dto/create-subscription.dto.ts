import { IsEnum, IsInt } from 'class-validator';
import { PlanType } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsInt()
  companyId: number;

  @IsEnum(PlanType)
  planId: PlanType; // ✅ Usar enum do Prisma
}
