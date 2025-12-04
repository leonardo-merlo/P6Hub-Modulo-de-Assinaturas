import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CompanyRole, PlanType, SubscriptionStatus } from '@prisma/client';

const PLANS = {
  [PlanType.BASIC]: {
    id: PlanType.BASIC,
    name: 'Plano Básico',
    price: 29.99,
    description: 'Ideal para pequenas empresas',
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Plano Pro',
    price: 99.99,
    description: 'Para empresas em crescimento',
  },
  [PlanType.ENTERPRISE]: {
    id: PlanType.ENTERPRISE,
    name: 'Plano Enterprise',
    price: 299.99,
    description: 'Solução completa para grandes empresas',
  },
};

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async checkout(createSubscriptionDto: CreateSubscriptionDto, userId: number) {
    const { companyId, planId } = createSubscriptionDto;

    // Verificar se plano existe
    if (!PLANS[planId]) {
      throw new BadRequestException('Invalid plan');
    }

    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Verificar se usuário é owner da empresa
    const companyUser = await this.prisma.companyUser.findFirst({
      where: {
        companyId,
        userId,
        roleInCompany: CompanyRole.OWNER,
        isActive: true,
      },
    });

    if (!companyUser) {
      throw new BadRequestException('You are not the owner of this company');
    }

    // Verificar se já existe assinatura
    let subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    // Calcular datas (simulado: 30 dias)
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    if (subscription) {
      // Atualizar assinatura existente
      subscription = await this.prisma.subscription.update({
        where: { companyId },
        data: {
          planId, // ✅ Já é PlanType do DTO
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
          canceledAt: null,
        },
      });
    } else {
      // Criar nova assinatura
      subscription = await this.prisma.subscription.create({
        data: {
          companyId,
          planId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
        },
      });
    }

    const plan = PLANS[planId];

    return {
      message: 'Subscription created successfully',
      subscription,
      checkoutUrl: `https://stripe.com/checkout/${subscription.id}`,
      plan,
      amount: plan.price,
      currency: 'BRL',
    };
  }

  async getMySubscription(userId: number) {
    // Buscar empresas ativas do usuário
    const companyUsers = await this.prisma.companyUser.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        company: {
          include: {
            subscriptions: true,
          },
        },
      },
    });

    if (companyUsers.length === 0) {
      throw new NotFoundException('User has no companies');
    }

    // Retornar todas as assinaturas do usuário
    const subscriptions = companyUsers
      .filter((cu) => cu.company.subscriptions.length > 0)
      .map((cu) => {
        const subscription = cu.company.subscriptions[0];
        const plan = PLANS[subscription.planId];

        return {
          company: cu.company,
          roleInCompany: cu.roleInCompany,
          subscription,
          plan,
          status: subscription.status,
          amount: plan.price,
          currency: 'BRL',
        };
      });

    return subscriptions;
  }

  async cancelSubscription(companyId: number, userId: number) {
    // Verificar se usuário é owner da empresa
    const companyUser = await this.prisma.companyUser.findFirst({
      where: {
        companyId,
        userId,
        roleInCompany: CompanyRole.OWNER,
        isActive: true,
      },
    });

    if (!companyUser) {
      throw new BadRequestException('You are not the owner of this company');
    }

    // Buscar assinatura
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Cancelar assinatura
    const canceledSubscription = await this.prisma.subscription.update({
      where: { companyId },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      },
    });

    return {
      message: 'Subscription canceled successfully',
      subscription: canceledSubscription,
    };
  }

  async getPlans() {
    return Object.values(PLANS);
  }
}
