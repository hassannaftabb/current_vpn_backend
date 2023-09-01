import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDto } from './dto/google.dto';
import { EmailLoginDto } from './dto/local.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminAuthDto } from './dto/admin.dto';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login-via-email')
  loginViaEmail(@Body() emailLoginDto: EmailLoginDto) {
    return this.authService.logInViaEmail(emailLoginDto);
  }

  @Post('auth-via-google')
  authViaGoogle(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.authViaGoogle(googleAuthDto);
  }

  @Post('admin')
  adminLogin(@Body() adminAuthDto: AdminAuthDto) {
    return this.authService.adminAuth(adminAuthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check_auth')
  checkAuth(@Req() req) {
    return req.user;
  }

  @UseGuards(AdminAuthGuard)
  @Post('check_admin_auth')
  checkAdminAuth(@Req() req) {
    return req.user;
  }
}
