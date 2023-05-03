import { ServicesService } from '../bussiness-logic/charge-internet/services.service';
import { Module } from '@nestjs/common';
import { WalletController } from './controller/wallet.controller';
import { WalletService } from './wallet-services/wallet.service';
import { TransactionsController } from './controller/transactions.controller';
import { CallbackController } from './controller/callback.controller';
import { WalletTransferModule } from './wallet-transfer/wallet-transfer.module';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { WalletServiceModule } from './wallet-services/wallet.module';

@Module({
  imports: [WalletTransferModule, WalletServiceModule],
  controllers: [WalletController, TransactionsController, CallbackController],
})
export class WalletModule {}
