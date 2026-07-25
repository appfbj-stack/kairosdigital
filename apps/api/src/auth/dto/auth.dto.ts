import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'minha-imobiliaria' })
  @IsString()
  @MinLength(3)
  slug: string;

  @ApiProperty({ example: 'Imobiliária João Silva' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'joao@imobiliaria.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'REAL_ESTATE', required: false, enum: ['REAL_ESTATE', 'AUTOMOTIVE', 'RETAIL', 'FOOD_SERVICE', 'HEALTH', 'BEAUTY', 'EDUCATION', 'SERVICES', 'CUSTOM'] })
  @IsOptional()
  @IsEnum(['REAL_ESTATE', 'AUTOMOTIVE', 'RETAIL', 'FOOD_SERVICE', 'HEALTH', 'BEAUTY', 'EDUCATION', 'SERVICES', 'CUSTOM'])
  vertical?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'joao@imobiliaria.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  password: string;
}