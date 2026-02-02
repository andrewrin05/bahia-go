import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  async requestOtp(@Body() body: { email: string }) {
    return this.authService.requestOtp(body.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; code: string }) {
    return this.authService.verifyOtp(body.email, body.code);
  }

  @Post('register-password')
  async registerPassword(@Body() body: { email: string; password: string }) {
    return this.authService.registerPassword(body.email, body.password);
  }

  @Post('login-password')
  async loginPassword(@Body() body: { email: string; password: string }) {
    return this.authService.loginPassword(body.email, body.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req) {
    return this.authService.profile(req.user.userId);
  }
}