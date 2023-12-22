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
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChangePasswordDto } from './dto/update-pass.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
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

  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(id, changePasswordDto);
  }
}
