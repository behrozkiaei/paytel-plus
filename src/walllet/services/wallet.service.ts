import { UpdateWalletDto } from '../dto/update-wallet.dto';
/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import {  Role, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from './transactions.service';
import { TransferDto } from '../dto/transfer.dto';
import moment from 'moment-jalaali';

@Injectable()
export class WalletService { 
    constructor(private prisma : PrismaService ,private transactionService : TransactionsService){}
    async createWallet(user : User){
        try {
            const wallet = await this.prisma.wallet.create({
            data: {
              userId :user.id,
              walletType : user?.role,
              date : moment().format('jYYYY/jMM/jDD'),
            }
          });
          return {...wallet};
        } catch (error) {
          if (
            error instanceof
            PrismaClientKnownRequestError
          ) {
              return({message :error.message})
          }
          throw error;
        }
    }


    async getWalletById(id: string) {
        return this.prisma.wallet.findUnique({
          where: {
            id,
          },
        });
      }
      async getWalletByType(walletType: string) {
        return this.prisma.wallet.findFirst({
          where: {
            walletType,
          },
        });
      }
      async getWalletByUserId(id: string) {

        return this.prisma.wallet.findFirst({
          where: {
            userId : id
          },
        });
      }

      
      async getAllWallet() {
        return this.prisma.wallet.findMany();
      }
  
      async updateWallet(
        id: string,
        dto: UpdateWalletDto,
      ) {
        // get the bookmark by id
        const wallet =
          await this.prisma.wallet.findUnique({
            where: {
              id: id,
            },
          });
  
        // check if user owns the bookmark
        if (!wallet || wallet.id !== id)
          throw new ForbiddenException(
            'Access to resources denied',
          );
  
        return this.prisma.wallet.update({
          where: {
            id:id,
          },
          data: {
            ...dto,
          },
        });
      }


      async deleteWallet(
        id: string,
      ) {
        const wallet =
          await this.prisma.wallet.findUnique({
            where: {
              id: id,
            },
          });
  
        // check if user owns the bookmark
        if (!wallet || wallet.id !== id)
          throw new ForbiddenException(
            'Access to resources denied',
          );
  
        await this.prisma.wallet.delete({
          where: {
            id: id,
          },
        });
      }

      async customerPaymentRequest(amount , customerId) {

        const resnum = Date.now().toString();
        const config = await this.prisma.config.findFirst({})
          try {
              const wallet = await this.getWalletByUserId(customerId)
              await this.prisma.walletTransaction.create({
                data : {
                  destWalletId : wallet.id,
                  amount :+amount,
                  resnum: resnum,
                  date : moment().format('jYYYY/jMM/jDD'),
                }
              })
              return {
                  result:{
                    form:true,
                    link: config.paymentLink,
                    Amount: amount,
                    ResNum: resnum,
                    MID : config.MID,
                    RedirectURL :config.paymentCallback
                  }  ,
                  status : true,
                  statusCode : 0
              }
          }catch (e) {
            return {
                  result: null,
                  statusCode : 1 ,
                  status:false,
                  message:"Failed to insert data",
              }
          }
    };

  async transferMoneyWallet2Wallet(sourceWalletId,destWalletId,amount,desc=""){
     const  date = moment().format('jYYYY/jMM/jDD')
     try{
       
       const sourceWallet =await this.prisma.wallet.findUnique({
         where :{id : sourceWalletId}
        })
        
        console.log(sourceWallet)
      const destWallet = await this.prisma.wallet.findUnique({
         where :{id : destWalletId}
        })
      if(!destWallet){
          throw new ForbiddenException(
          'Dest wallet not founded',
      );}
      if(!sourceWallet){
        throw new ForbiddenException(
          'source Wallet  not founded',
          );
        }
        console.log(amount)
        console.log("sourceWallet.amount",sourceWallet.amount)
        if(+amount > +sourceWallet.amount){
          throw new ForbiddenException(
          'Amount not enough',
        );
      }
      await this.prisma.wallet.update({
          where :{
            id : sourceWalletId
          },
          data:{
            amount : (+sourceWallet.amount) - (+amount)
          }
        })
      await this.prisma.wallet.update({
        where :{
          id : destWalletId
        },
        data:{
          amount :(+destWallet.amount) + (+amount)
        }
      })

      await this.prisma.walletTransfer.create({
        data : {
          destWalletId : destWalletId,
          sourceWalletId:sourceWalletId,
          amount : +amount,
          date : date,
          description :desc
        }
      })
      return {
        status :true,
        result :null
      }
    }catch(err){
      console.log(err)
      return  {
        status :false,
        result :null
      };
    }
  }



  async transfer(dto :TransferDto){
    // return true;
    console.log(1)
    const masterWallet =await this.prisma.wallet.findFirst({
      where: {
        walletType : "MASTER"
      },
      select : {
        id :true,
        amount :true,
        User : {
          select :{
            id :true
          }
        }
      }
    })

    if(!masterWallet){
      throw new ForbiddenException("Master wallet not founded")
    }

    const userWallet =await  this.prisma.user.findUnique({
      where : {
        id : dto.userId
      },
      include :{
        Wallet:true
      }
    })
    if(!userWallet ||!userWallet.Wallet ){
      throw new ForbiddenException("Master wallet not founded")
    }

    if(dto.mode == "increase"){
          try{
            return this.transferMoneyWallet2Wallet(masterWallet?.id,userWallet.Wallet.id,dto.amount,"افزایش اعتبار توسط ادمین")
           
          }catch(e){
            console.log(e)
            return {
              status : false,
              message: "something wrong"
            }
          }
      }
      
    
    if(dto.mode == "decrease"){
          try{
            return this.transferMoneyWallet2Wallet(userWallet.Wallet.id,masterWallet.id,dto.amount,"کاهش اعتبار توسط ادمین")
           
          }catch(e){
            console.log(e)
            return {
              status : false,
              message: "something wrong"
            }
          }

     }

  }
}
