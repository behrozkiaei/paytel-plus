import { Module } from '@nestjs/common';
import { WalletTransferService } from './wallet-transfer.service';
import { WalletTransferController } from './wallet-transfer.controller';

@Module({
  controllers: [WalletTransferController],
  providers: [WalletTransferService],
  exports: [WalletTransferService],
})
export class WalletTransferModule {}
