import { WalletService } from '../wallet-services/wallet.service';
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Get, Param, Query, Render } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { response } from 'express';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';

@ApiTags('transactions Callback Rout')
@Controller('transactions')
export class CallbackController {
  constructor(private transactionService: TransactionsService) {}

  @Get('callback')
  @Render('index')
  callback(@Query() query: any) {
    return this.transactionService.handleCallback(query);
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
