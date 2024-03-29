import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChangePasswordDto } from './dto/update-pass.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
  @Patch('/profile-picture')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  updateProfilePicture(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.userService.updateUserProfilePicture(req.user.id, image);
  }
  @Post('/refresh-token')
  refreshToken(@Body() body) {
    return this.userService.validateRefreshTokenAndGenerateAccessToken(
      body.refreshToken,
    );
  }
  @Get('all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  getUserById(@Request() req) {
    return this.userService.getUserById(req.user.id);
  }

  @Delete(':id')
  deleteUserById(@Param('id') id: string) {
    return this.userService.deletUserById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('time')
  manageTime(@Body() body, @Request() req) {
    return this.userService.manageUserTime(req.user.id, body.time);
  }
  @UseGuards(JwtAuthGuard)
  @Get('time')
  getTime(@Request() req) {
    return this.userService.getUserTime(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('devices')
  getUserDevices(@Request() req) {
    return this.userService.getUserDevices(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('devices/:device_id')
  deleteUserDevice(@Request() req, @Param('device_id') device_id) {
    return this.userService.deleteUserDevice(req.user.id, device_id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('cancel-account')
  cancelAccount(@Request() req) {
    return this.userService.cancelAccount(req.user.id);
  }
  @Patch(':id')
  updateUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Get('resend-otp/:email')
  resendOtp(@Param('email') email: string) {
    return this.userService.resendOtp(email);
  }

  @Post('initiate-reset-password/:email')
  initiateResetPassword(@Param('email') email: string) {
    return this.userService.initiateResetPassword(email);
  }

  @Post('confirm-reset-password')
  confirmResetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    const { email, otp, newPassword } = body;
    if (!email || !otp || !newPassword) {
      throw new HttpException(
        'Missing required parameters',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.userService.confirmResetPassword(
      email,
      parseInt(otp),
      newPassword,
    );
  }

  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(id, changePasswordDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('referall-stats')
  referalls(@Request() req) {
    return this.userService.getUserReferallInfo(req.user.id);
  }
  // @UseGuards(JwtAuthGuard)
  // @Post('auto-login')
  // autoLoginHandler(@Request() req) {
  //   return this.userService.captureOrMatchAutoLoginKey(
  //     req.user.id,
  //     req.body.deviceId,
  //   );
  // }
}
