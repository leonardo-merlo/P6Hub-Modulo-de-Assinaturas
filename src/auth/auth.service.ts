import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client'; // ✅ Importar enum
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // Verificar se usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário com role USER
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
      },
      select: {
        // ✅ Não retornar password
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Gerar JWT
    const token = this.generateToken(user);

    return {
      access_token: token,
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuário (incluir password para validação)
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      // ✅ Verificar se está ativo
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Gerar JWT
    const token = this.generateToken(user);

    // Retornar sem password
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token: token,
      user: userWithoutPassword,
    };
  }

  async validateUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        // ✅ Não retornar password
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  // ✅ Método privado para gerar token
  private generateToken(user: { id: number; email: string; role: UserRole }) {
    return this.jwtService.sign({
      sub: user.id, // ✅ Usar 'sub' (padrão JWT)
      email: user.email,
      role: user.role,
    });
  }
}
