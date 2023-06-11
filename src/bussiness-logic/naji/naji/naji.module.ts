import { Module } from '@nestjs/common';
import { NajiController } from './naji/naji.controller';
import { NajiService } from './naji/naji.service';
import { TransactionsService } from '../../../walllet/wallet-services/transactions.service';
import { UserService } from '../../../user/user.service';
import { WalletService } from '../../../walllet/wallet-services/wallet.service';
import { OrderMakerService } from '../../../walllet/wallet-services/order-maker.service';
import { AuthService } from '../../../auth/auth.service';
import { ServicesService } from '../../../bussiness-logic/charge-internet/services.service';
import { JwtService } from '@nestjs/jwt';
import { SmsService } from '../../../utils/sms_handler';
import { NajiAuthController } from './naji/naji-auth.controller';
import { NajiCallbackController } from './naji/callback.controller';

@Module({
  imports :[],
  controllers: [NajiController,NajiAuthController,NajiCallbackController],
  providers: [
    NajiService,
    TransactionsService,
    UserService,
    WalletService,
    OrderMakerService,
    TransactionsService,
    AuthService,
    ServicesService,JwtService,SmsService
  ],
  exports: [NajiService],
})
export class NajiModule {}
