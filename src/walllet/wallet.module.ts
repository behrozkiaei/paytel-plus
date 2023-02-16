
/* eslint-disable prettier/prettier */
import { PaymentRequestController } from './controller/payment-request.conteroller';
import { Module } from '@nestjs/common';
import { WalletController } from './controller/wallet.controller';
import { WalletService } from './services/wallet.service';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controller/transactions.controller';
import { CallbackController } from './controller/callback.controller';
import { WalletTransferModule } from './wallet-transfer/wallet-transfer.module';
import { PaymentRequestService } from './services/payment-request.service';

@Module({
    imports: [WalletTransferModule],
    controllers: [WalletController,TransactionsController,CallbackController,PaymentRequestController],
    providers: [
        WalletService,TransactionsService,PaymentRequestService],
    exports :[WalletService]
})
export class WalletModule { }
