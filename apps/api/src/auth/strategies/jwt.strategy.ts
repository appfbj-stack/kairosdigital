import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'super-secret-change-in-production',
    });
  }

  async validate(payload: { tenantId: string; slug: string }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: payload.tenantId },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant inválido');
    }

    return { tenantId: tenant.id, slug: tenant.slug };
  }
}