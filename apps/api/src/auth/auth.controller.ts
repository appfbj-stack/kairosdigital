import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantGuard } from './guards/tenant.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo tenant + owner' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('validate/:slug')
  @ApiOperation({ summary: 'Validar slug do tenant (público)' })
  async validateSlug(@Param('slug') slug: string) {
    const tenant = await this.authService.validateTenant(slug);
    if (!tenant) return { valid: false };
    return { 
      valid: true, 
      tenant: { 
        id: tenant.id, 
        slug: tenant.slug, 
        name: tenant.name,
        vertical: tenant.vertical,
        primaryColor: tenant.primaryColor,
        logoUrl: tenant.logoUrl,
      } 
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do tenant logado' })
  async me(@Req() req: any) {
    return req.tenant;
  }
}