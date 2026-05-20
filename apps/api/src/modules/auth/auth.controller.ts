import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(4) password!: string;
  @IsOptional() @IsString() totpCode?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login email + password (+ optional 2FA code)' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password, dto.totpCode);
  }
}
