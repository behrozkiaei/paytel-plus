import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { PayBill } from './dto/pay-bill-no-auth.dto';
import { BillService } from './bill.service';
import { redirectUrl } from 'src/utils/interfaces/bill.interfaces';

@ApiTags("Bill no Auth auth services Api's")
@Controller('bill-no-auth')
export class BillAuthAuthController {
  constructor(
    private billService: BillService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
  ) {}

  // "bill-no-auth/inquiry-by-pay-id-and-bill-id"
  @Post('inquiry-by-pay-id-and-bill-id')
  billInquiryByPayIdAndBillIdNoAuth(@Body() dto: PayBill): Promise<INewResponseAPI<any>> {

    return this.billService.billInquiryByPayIdAndBillIdNoAuth(dto) ;
  }

  // "bill-no-auth/pay-by-pay-id-bill-id"
  @Post('pay-by-pay-id-bill-id')
  billIPaymentByPayIdAndBillIdNoAuth(@Body() dto: PayBill): Promise<INewResponseAPI<any>> {

    return this.billService.billIPaymentByPayIdAndBillIdNoAuth(dto) ;
  }
}