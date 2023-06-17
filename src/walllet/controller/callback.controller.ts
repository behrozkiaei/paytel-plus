import { WalletService } from '../wallet-services/wallet.service';
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Get, Param, Query, Render, Res } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { response } from 'express';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';

@ApiTags('transactions Callback Rout')
@Controller('transactions')
export class CallbackController {
  constructor(private transactionService: TransactionsService, private config: ConfigService) {}

  @Get('callback')
  async callback(@Query() query: any , @Res() res  ) {
    const response = await this.transactionService.handleCallback(query);
    if(response.result.otderId ){
      return res.redirect(`${this.config.get('FRONT_SERVER')}/receipt/?id=${response.result.otderId}`);
    }else{
      res.JSON(`Transaction Not founded`)
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
