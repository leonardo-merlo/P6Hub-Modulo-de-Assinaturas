import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyUserDto } from './dto/create-company-user.dto';
import { CompanyRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompanyUsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyUserDto, actingUserId: number) {
    const { companyId, collaboratorEmail, roleInCompany } = dto;

    const actingUser = await this.prisma.user.findUnique({
      where: { id: actingUserId },
    });

    if (!actingUser) {
      throw new BadRequestException('Usuário autenticado não encontrado');
    }

    // ADMIN sempre pode criar OWNER ou COLLABORATOR
    if (actingUser.role !== 'ADMIN') {
      // Se não é admin, deve ser OWNER da empresa
      const isOwner = await this.prisma.companyUser.findFirst({
        where: {
          companyId,
          userId: actingUserId,
          roleInCompany: 'OWNER',
        },
      });

      if (!isOwner) {
        throw new ForbiddenException(
          'Apenas ADMIN ou OWNERS da empresa podem adicionar colaboradores.',
        );
      }
    }

    // Verificar se já existe um usuário com esse email
    let targetUser = await this.prisma.user.findUnique({
      where: { email: collaboratorEmail },
    });

    // 2️⃣ Criar senha temporária se usuário não existir
    let tempPassword: string | null = null;

    if (!targetUser) {
      tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      targetUser = await this.prisma.user.create({
        data: {
          email: collaboratorEmail,
          role: 'USER',
          password: hashedPassword,
        },
      });
    }

    // Verificar se já existe relação
    const existingRelation = await this.prisma.companyUser.findFirst({
      where: {
        companyId,
        userId: targetUser.id,
      },
    });

    if (existingRelation) {
      throw new BadRequestException(
        'Esse usuário já está vinculado à empresa.',
      );
    }

    // 3️⃣ Criar vínculo CompanyUser
    const relation = await this.prisma.companyUser.create({
      data: {
        companyId,
        userId: targetUser.id,
        roleInCompany,
      },
    });

    // 4️⃣ Retorno final incluindo a senha temporária
    return {
      ...relation,
      temporaryPassword: tempPassword ?? undefined,
    };
  }

  async findByCompanyId(companyId: number) {
    return await this.prisma.companyUser.findMany({
      where: { companyId },
      include: { user: true },
    });
  }

  async findByUserId(userId: number) {
    return await this.prisma.companyUser.findMany({
      where: { userId },
      include: { company: true },
    });
  }
}
