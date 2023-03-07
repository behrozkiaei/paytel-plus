import { ServicesService } from './../services/services.service';
import { Module } from '@nestjs/common';
import { WalletController } from './controller/wallet.controller';
import { WalletService } from './services/wallet.service';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controller/transactions.controller';
import { CallbackController } from './controller/callback.controller';
import { WalletTransferModule } from './wallet-transfer/wallet-transfer.module';
import { OrderMakerService } from './services/order-maker/order-maker.service';

@Module({
  imports: [WalletTransferModule],
  controllers: [WalletController, TransactionsController, CallbackController],
  providers: [
    WalletService,
    TransactionsService,
    OrderMakerService,
    ServicesService,
  ],
  exports: [WalletService, TransactionsService],
})
export class WalletModule {}
