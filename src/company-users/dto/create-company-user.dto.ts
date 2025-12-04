import { IsEmail, IsEnum, IsInt } from 'class-validator';
import { CompanyRole } from '@prisma/client';

export class CreateCompanyUserDto {
  @IsInt()
  companyId: number;

  @IsEmail()
  collaboratorEmail: string;

  @IsEnum(CompanyRole)
  roleInCompany: CompanyRole; // ✅ Usar enum do Prisma
}
