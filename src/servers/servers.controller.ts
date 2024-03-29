import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  create(@Body() createServerDto: CreateServerDto) {
    return this.serversService.create(createServerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-connection-details/:server')
  getConnectionDetails(@Request() req, @Param('server') server) {
    return this.serversService.getConnectionDetails(req.user.id, server);
  }

  @Get()
  findAll() {
    return this.serversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serversService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-ovpn-config/:server')
  getOvpnConfig(@Request() req, @Param('server') server) {
    return this.serversService.getOvpnConfig(req.user.id, server);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
    return this.serversService.update(id, updateServerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serversService.remove(id);
  }
}
