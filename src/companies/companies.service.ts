import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const { name, cnpj } = createCompanyDto;

    // Verificar se empresa já existe
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj },
    });

    if (existingCompany) {
      throw new BadRequestException('Company with this CNPJ already exists');
    }

    return await this.prisma.company.create({
      data: {
        name,
        cnpj,
      },
    });
  }

  async findAll() {
    return await this.prisma.company.findMany({
      include: {
        companyUsers: true,
        subscriptions: true,
      },
    });
  }

  async findById(id: number) {
    return await this.prisma.company.findUnique({
      where: { id },
      include: {
        companyUsers: true,
        subscriptions: true,
      },
    });
  }
}
