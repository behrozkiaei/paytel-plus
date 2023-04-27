import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRequestController } from './payment-request.controller';
import { PaymentRequestService } from './payment-request.service';

describe('PaymentRequestController', () => {
  let controller: PaymentRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentRequestController],
      providers: [PaymentRequestService],
    }).compile();

    controller = module.get<PaymentRequestController>(PaymentRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
