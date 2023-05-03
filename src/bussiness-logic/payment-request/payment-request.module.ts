import { Module } from '@nestjs/common';
import { PaymentRequestService } from './payment-request.service';
import { PaymentRequestController } from './payment-request.controller';

@Module({
  controllers: [PaymentRequestController],
  providers: [PaymentRequestService],
})
export class PaymentRequestModule {}
