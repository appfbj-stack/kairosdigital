import { IsString, IsOptional, IsEnum, MinLength, IsUrl, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'minha-imobiliaria' })
  @IsString()
  @MinLength(3)
  slug: string;

  @ApiProperty({ example: 'Imobiliária João Silva' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({ example: 'João Imóveis' })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiPropertyOptional({ 
    example: 'REAL_ESTATE', 
    enum: ['REAL_ESTATE', 'AUTOMOTIVE', 'RETAIL', 'FOOD_SERVICE', 'HEALTH', 'BEAUTY', 'EDUCATION', 'SERVICES', 'CUSTOM'] 
  })
  @IsOptional()
  @IsEnum(['REAL_ESTATE', 'AUTOMOTIVE', 'RETAIL', 'FOOD_SERVICE', 'HEALTH', 'BEAUTY', 'EDUCATION', 'SERVICES', 'CUSTOM'])
  vertical?: string;

  @ApiPropertyOptional({ example: '#2563eb' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#1e40af' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: 'https://meusite.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Bem-vindo à nossa imobiliária!' })
  @IsOptional()
  @IsString()
  welcomeMsg?: string;

  @ApiPropertyOptional({ description: 'Configuração vertical (JSON)' })
  @IsOptional()
  verticalConfig?: any;

  @ApiPropertyOptional({ description: 'Prompt customizado para o Hermes' })
  @IsOptional()
  @IsString()
  customPrompt?: string;

  @ApiPropertyOptional({ example: 'starter', enum: ['starter', 'pro', 'enterprise'] })
  @IsOptional()
  @IsEnum(['starter', 'pro', 'enterprise'])
  planPlan?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  maxLeads?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  maxMessagesMonth?: number;
}

export class UpdateTenantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiPropertyOptional({ enum: ['REAL_ESTATE', 'AUTOMOTIVE', 'RETAIL', 'FOOD_SERVICE', 'HEALTH', 'BEAUTY', 'EDUCATION', 'SERVICES', 'CUSTOM'] })
  @IsOptional()
  @IsEnum(['REAL_ESTATE', 'AUTOMOTIVE', 'RETAIL', 'FOOD_SERVICE', 'HEALTH', 'BEAUTY', 'EDUCATION', 'SERVICES', 'CUSTOM'])
  vertical?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  welcomeMsg?: string;

  @ApiPropertyOptional()
  @IsOptional()
  verticalConfig?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customPrompt?: string;

  @ApiPropertyOptional({ enum: ['starter', 'pro', 'enterprise'] })
  @IsOptional()
  @IsEnum(['starter', 'pro', 'enterprise'])
  planPlan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLeads?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxMessagesMonth?: number;
}