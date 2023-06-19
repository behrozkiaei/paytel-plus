/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Get, Query, Render, Res } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';

@ApiTags('transactions Callback Rout')
@Controller('transactions')
export class CallbackController {
  constructor(private transactionService: TransactionsService, private config: ConfigService) {}

  @Get('callback')
  async callback(@Query() query: any , @Res() res:any  ) {
    const response = await this.transactionService.handleCallback(query);
    if(response.result.otderId ){
      return res.redirect(`${this.config.get('FRONT_SERVER')}/receipt/?id=${response.result.orderId}`);
    }else{
      return res.redirect(`${this.config.get('FRONT_SERVER')}/receipt/?id=${response.result.orderId}`);
    }
  }

  @Get("order-by-id")
  getOrderById(@Query("id") id :string) {
    console.log(id)
      return  this.transactionService.getOrderByIdnoAuth(id);
  }
  @Get('order-page')
  @Render('order')
  async getOrderPage(@Query("id") id :string) {
    const res = await   this.transactionService.getOrderByIdnoAuth(id);
    return res.result
  }
}
