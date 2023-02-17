import { WalletService } from './../services/wallet.service';
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Get, Post, Query, Render } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './../services/transactions.service';
import { response } from 'express';


@ApiTags("transactions Callback Rout")
@Controller("transactions")
export class CallbackController {

    constructor(private transactionService : TransactionsService){}

    @Get("callback")
    @Render('index')
    callback(@Query() query :any) {
        return  this.transactionService.handleCallback(query);   
    }
}