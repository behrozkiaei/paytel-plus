import { WalletService } from './../services/wallet.service';
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Get, Post, Render } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './../services/transactions.service';
const soap = require('soap');


@ApiTags("Wallet Callback Rout")
@Controller("transactions")
export class CallbackController {

    constructor(
        private walletService :WalletService,
        private transactionService : TransactionsService){}

    @Get("/testCallbak")
    @Render('index')
    testCallback(){
        
        const body = 
          {  State: 'OK',
            StateCode: '0',
            ResNum: '1662538493575',
            MID: '12711399',
            RefNum: 'GmshtyjwKStmyMmlzBZq/hxLERLNo8Kb8zOmTIdNYG',
            CID: '32DE5F80F1AF37337085EE4EE01CA5036C946572E96927A2F654911A5F8E780D',
            TRACENO: '742227',
            RRN: '20740155187',
            Amount: '20000',
            website: 'hi-kish.ir',
            SecurePan: '610433******9422' } 


        return {
            status: false,
            result : {...body},
            message : "ناموفق"
        }
    }


    @Post("callback")
    @Render('index')
    async callback(@Body() body :any) {

        const {
            State,
            StateCode,
            ResNum,
            MID,
            RefNum,
            CID,
            TRACENO,
            Amount,
            RRN,
            SecurePan
        } = body;
        

        // canceled body {
        //     State: 'Canceled By User',
        //     StateCode: '-1',
        //     ResNum: '1662526967300',
        //     MID: '12711399',
        //     RefNum: '',
        //     CID: '',
        //     TRACENO: '',
        //     RRN: '',
        //     SecurePan: ''
        //   }

        // {
        //     State: 'OK',
        //     StateCode: '0',
        //     ResNum: '1662538493575',
        //     MID: '12711399',
        //     RefNum: 'GmshtyjwKStmyMmlzBZq/hxLERLNo8Kb8zOmTIdNYG',
        //     CID: '32DE5F80F1AF37337085EE4EE01CA5036C946572E96927A2F654911A5F8E780D',
        //     TRACENO: '742227',
        //     RRN: '20740155187',
        //     Amount: '20000',
        //     website: 'hi-kish.ir',
        //     SecurePan: '610433******9422'
        //   }

        if(State != "Ok"){
            return{
                result: {...body} ,
                status:false,
                message: (State == "Canceled By User")? "کنسل شده توسط کاربر" : "مشکل در برقراری ارتباط" 
            }

        }
        try {

            const  transaction = await this.transactionService.getTransacrionByResNum(ResNum);
            const wallet = await this.walletService.getWalletById(transaction.destWalletId)
            if (!transaction) return {
                result: {...body} ,
                status:false,
                message:"چنین تراکنش وجود ندارد"
            }
            
            if (transaction.isPaid == true) {
                return {result:{
                    ...body
                } ,status:false,
                message:"تراکنش منقضی شده است"}
            }
            if(State!= 'OK'){
                this.transactionService.updateTransaction(transaction.id , {
                    isPaid : false,
                    resnum: ResNum,
                    securePan:SecurePan
                })
                return {result : {...body} ,status:false, message:State}
               
            }
            const client = soap.createClient('https://sep.shaparak.ir/payments/referencepayment.asmx?WSDL', function (err, client) {
                if (err) throw new Error(err);
                client.verifyTransaction1({
                    String_1: RefNum,
                    String_2: "12711399",
                }, async function (err, result) {
                    if (err) throw new Error(err);
                    console.log(result)
                    //check if status is success
                    const transaction_result = parseInt(result.result.$value);
                    
                    if (transaction_result > 0) {

                        this.transactionService.updateTransaction(transaction.id , {
                            isPaid : true,
                            rrn: RRN,
                            traceNumber : TRACENO,
                            resnum: ResNum,
                            RefNum:RefNum,
                            securePan:SecurePan
                        })
                        const masterWallet = this.walletService.getWalletByType("MASTER")
                        if(!masterWallet){
                           throw new Error(err);
                        }
                        const transfer  = await this.walletService.transferMoneyWallet2Wallet(masterWallet.id, wallet.id,transaction.amount, "تراکنش بانکی")
                        if(!transfer){
                            throw new Error(err);
                        }
                        return {
                            status:true,
                            result : {
                                ...body ,
                            }
                        }
                    }else{
                        return {status:false , result : {
                            ...body
                        }} 
                    }
                });
            });
                
        } catch(e){
            return {status:false,result :{...body}}
        }
}
}