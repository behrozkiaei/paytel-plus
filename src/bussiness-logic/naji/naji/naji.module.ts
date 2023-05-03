import { Module } from '@nestjs/common';
import { NajiController } from './naji/naji.controller';
import { NajiService } from './naji/naji.service';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
import { UserService } from 'src/user/user.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';

@Module({
  controllers: [NajiController],
  providers: [
    NajiService,
    TransactionsService,
    UserService,
    WalletService,
    OrderMakerService,
    TransactionsService,
  ],
  exports: [NajiService],
})
export class NajiModule {}
