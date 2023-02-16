import { CreateUserDto } from './dto/create-user.dto';
/* eslint-disable prettier/prettier */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')

@ApiTags("Auth  Api's")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User Sign Up' })
  signup(@Body() merchant : CreateUserDto) {
    return this.authService.createMerchant(merchant);
  }
  @ApiOperation({ summary: 'User Sign In and get a token' })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

}
