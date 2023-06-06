import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { SmsService } from 'src/utils/sms_handler';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { BillService } from './bill.service';
import { ServicesService } from '../charge-internet/services.service';
import { BillAuthController } from './bill.controller';
import { BillNoAuthController } from './bill-no-auth.controller';

@Module({
  controllers: [BillAuthController,BillNoAuthController],
  providers: [
    TransactionsService,
    WalletService,
    OrderMakerService,
    AuthService,
    TransactionsService,
    UserService,
    WalletService,
    ServicesService,
    OrderMakerService,
    TransactionsService,
    AuthService,
    JwtService,SmsService , BillService
  ],
  exports: [BillService],
})
export class BillModule {}
