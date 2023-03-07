import { Injectable } from '@nestjs/common';
import { CashbackState } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UpdatePaymentRequestDto } from './dto/update-payment-request.dto';
const moment = require('moment-jalaali');
 
@Injectable()
export class PaymentRequestService {
  constructor ( private prisma :PrismaService){

  }
  async create(user : any , dto: CreatePaymentRequestDto) :Promise<INewResponseAPI<any>>{
   try{
   await  this.prisma.userPaymentRequest.create({
       data : {
          userId : user.id.toString(),
          amount : +dto.amount,
          date : moment().format('jYYYY/jMM/jDD HH:mm:ss'),
       }
     })
     return{
      status:true
     }
   }catch(e){
    return {
      status :false , 
      message : e.message ?? "خطا در ارسال" 
    }
   }
  }

  async  findAll(user : any ) : Promise<INewResponseAPI<any>>{
    try{
     const result  = await  this.prisma.userPaymentRequest.findMany({
          where : {
             userId : user.id
          },
          orderBy : {
            id : "desc"
          }
        })
        return{
         status:true,
         result :result 
        }
      }catch(e){
       return {
         status :false , 
         message : e.message ?? "خطا در ارسال" 
       }
      }
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentRequest`;
  }

  update(id: number, updatePaymentRequestDto: UpdatePaymentRequestDto) {
    return `This action updates a #${id} paymentRequest`;
  }

  async  remove(id: string) : Promise<INewResponseAPI<any>>{
    try{
      const request = await this.prisma.userPaymentRequest.findUnique({
        where: {
          id : id
        }
      })
      if(!request){
        throw Error("not founded")
      }
      if(request.state != CashbackState.PENDING){
        throw Error("موارد انجام شده قابل حذف نیستند")
      }

      await this.prisma.userPaymentRequest.delete({
        where:{
          id : id
        }
      })
      return {
        status:true,
      }
    }catch(e){
      console.log(e)
      return {
        status:false,
        message : e.message
      }
    }
  }
}
