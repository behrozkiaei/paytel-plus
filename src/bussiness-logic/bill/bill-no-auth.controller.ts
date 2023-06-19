import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { PayBill } from './dto/pay-bill-no-auth.dto';
import { BillService } from './bill.service';
import { redirectUrl } from 'src/utils/interfaces/bill.interfaces';
import { Roles } from 'src/auth/decorator/role.decorator';
import { User } from 'src/auth/decorator/user.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags("Bill no Auth auth services Api's")
@Controller('bill-no-auth')
export class BillNoAuthController {
  constructor(
    private billService: BillService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
    private config : ConfigService,
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

  

  @Post('bill-callback')
  async updateBill(
    @Body('status') status: string,
    @Body('ref_code') refCode: string,
    @Body('date') date: string,
    @Body('bill_id') billId: string,
    @Query() query: any,
    @Res() res
  ) {
    const payBillResult = { status, refCode };
    const orderId = query.orderId
    console.log(payBillResult)
    console.log(orderId)
    if (status === 'paid' ) {
     await this.billService.updateOrder( orderId,
      payBillResult,
        "پرداخت قبض")

    }else{
      
    }
    const url = `${this.config.get('FRONT_SERVER')}/receipt/?id=${orderId}`;
    console.log(url)
    return res.redirect(url);
  }

}