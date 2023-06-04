import { ServicesService } from './services.service';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { Roles } from '../../auth/decorator/role.decorator';
import { UseGuards, Get, Body } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from '../../auth/guard/role.guard';
import { Controller, Post } from '@nestjs/common';
import { Role } from 'src/utils/enums';
import { User } from 'src/auth/decorator/user.decorator';
import { InternetDto, chargeDto } from 'src/walllet/dto/internet.dto';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { AuthService } from 'src/auth/auth.service';
import { toEn } from 'src/utils/toEn';
import { phoneNumberNormalizer } from '@persian-tools/persian-tools';

@UseGuards(JwtGuard, RolesGuard)

@Controller('Services')
@ApiTags("Services Api's")
@Controller('Services')
export class ServicesController {
  constructor(private services: ServicesService, 
    private walletService: WalletService,
    private authService: AuthService,
    private OrderMakerService: OrderMakerService,
    private transactionService : TransactionsService) {
  
  }
  @Get('getInternetPackages')
  getInternetPackages(): Promise<INewResponseAPI<any>> {
    return this.services.getInternetPackages();
  }

  @Post('buy-charge-no-auth')
  async buyCharge(
    @Body() dto: chargeDto,
  ): Promise<INewResponseAPI<any>> {
    let dtoNoWallet : chargeDto ={
      ...dto,
      fromWallet :false,
    }
    const mobileEn = toEn(phoneNumberNormalizer(dto.mobile, '0'));
    let user = await this.authService.findUserByPhone(dto.mobile);
    if (!user) {
      user = await this.authService.createWalletIfUserNotExist(mobileEn);
    }
    return this.transactionService.buyCharge(user, dto);
  }

  @Post('buy-internet-no-auth')
  async buyInternet(
    @Body() dto: InternetDto,
  ): Promise<INewResponseAPI<any>>   {
    let dtoNoWallet : InternetDto ={
      ...dto,
      fromWallet :false,
    }
    const mobileEn = toEn(phoneNumberNormalizer(dto.mobile, '0'));
    let user = await this.authService.findUserByPhone(dto.mobile);
    if (!user) {
      user = await this.authService.createWalletIfUserNotExist(mobileEn);
    }

    return this.transactionService.buyInternet(user, dtoNoWallet);
  }


}
