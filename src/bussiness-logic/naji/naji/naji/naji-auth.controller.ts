import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { CreateUserNajiDto, VerifyUserNajiDto } from './dto/naji.dto';
import { NajiService } from './naji.service';

@ApiTags("Naji auth services Api's")
@Controller('naji-auth')
export class NajiAuthController {
  constructor(
    private najiService: NajiService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
  ) {}

  @Post('send-otp-when-not-login')
  getUserId(@Body() dto: CreateUserNajiDto): Promise<INewResponseAPI<any>> {
    return this.najiService.sendOtpWhenNotAppAuth(dto.mobile, dto.nationalCode);
  }

  @Post('verify-otp-when-not-login')
  verifyUser(@Body() dto: VerifyUserNajiDto): Promise<INewResponseAPI<any>> {
    return this.najiService.verifyOtpWhenNotAppAuth(dto);
  }

  @Get('callback')
  callback(@Query() query: any) {
    return this.najiService.handleCallback(query);
  }
}
