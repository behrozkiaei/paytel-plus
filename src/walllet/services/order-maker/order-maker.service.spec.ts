import { Test, TestingModule } from '@nestjs/testing';
import { OrderMakerService } from './order-maker.service';

describe('OrderMakerService', () => {
  let service: OrderMakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderMakerService],
    }).compile();

    service = module.get<OrderMakerService>(OrderMakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
