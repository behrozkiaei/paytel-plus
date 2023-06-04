import { WatchService } from '../../watch.service';
import { Module, CacheModule } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { TransactionsController } from 'src/walllet/controller/transactions.controller';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SmsService } from 'src/utils/sms_handler';
import { BillService } from './bill.service';

@Module({
  controllers: [],
  providers: [
    TransactionsService,
    WalletService,
    OrderMakerService,
    AuthService,
    TransactionsService,
    UserService,
    WalletService,
    OrderMakerService,
    TransactionsService,
    AuthService,
    JwtService,SmsService , BillService
  ],
  exports: [BillService],
})
export class BillModule {}
