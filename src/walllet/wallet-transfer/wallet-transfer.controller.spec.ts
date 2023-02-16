import { Test, TestingModule } from '@nestjs/testing';
import { WalletTransferController } from './wallet-transfer.controller';
import { WalletTransferService } from './wallet-transfer.service';

describe('WalletTransferController', () => {
  let controller: WalletTransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletTransferController],
      providers: [WalletTransferService],
    }).compile();

    controller = module.get<WalletTransferController>(WalletTransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
