import { Module } from '@nestjs/common';
import { OrderMakerService } from './order-maker.service';
import { TransactionsService } from './transactions.service';
import { WalletService } from './wallet.service';
import { ServicesService } from 'src/bussiness-logic/charge-internet/services.service';

@Module({
    providers: [OrderMakerService,TransactionsService,WalletService,ServicesService],
    exports :[OrderMakerService,TransactionsService,WalletService]
})
export class WalletServiceModule {}
