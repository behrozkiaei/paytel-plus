import { Test, TestingModule } from '@nestjs/testing';
import { WalletTransferService } from './wallet-transfer.service';

describe('WalletTransferService', () => {
  let service: WalletTransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletTransferService],
    }).compile();

    service = module.get<WalletTransferService>(WalletTransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
