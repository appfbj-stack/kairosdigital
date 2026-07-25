import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const tenant = await this.prisma.tenant.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        vertical: dto.vertical || 'CUSTOM',
        users: {
          create: {
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: 'OWNER',
          },
        },
      },
    });

    return this.generateTokens(tenant.id, tenant.slug);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { tenant: true },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return this.generateTokens(user.tenantId, user.tenant.slug);
  }

  async validateTenant(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  private generateTokens(tenantId: string, slug: string) {
    const payload = { tenantId, slug };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
      tenant: { id: tenantId, slug },
    };
  }
}