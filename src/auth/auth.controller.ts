import { SendOtp } from './dto/auth.dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { LoginUserDto, verifyOtpDto } from './dto/create-user.dto';
import { SetPassDto } from './dto/set-pass.dto';

@Controller('auth')
@ApiTags("Auth  Api's")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signIn')
  @ApiOperation({ summary: 'User  signIn' })
  signIn(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtp) {
    return this.authService.sendOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  verifyOtp(@Body() dto: verifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('set-pass')
  setPass(@Body() dto: SetPassDto) {
    console.log(dto);
    return this.authService.setPassword(dto);
  }

}
