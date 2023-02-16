/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import moment from 'moment-jalaali';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';


@Injectable()
export class TransactionsService {
    constructor(private prisma : PrismaService){
        
    }
    async createTransaction(dto :any){
        try {
            const walletTransaction = await this.prisma.walletTransaction.create({
            data: {
              ...dto,
              date : moment().format('jYYYY/jMM/jDD'),
            }
          });
          return {...walletTransaction};
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


    async getTRansactionById(id: string) {
        return this.prisma.walletTransaction.findUnique({
          where: {
            id,
          },
        });
      }
      
      async getAllTransaction(user,index=1 , limit =10,from ="0" , to="99999999999999",isExcel=false){

        let query ;
        let where ;
        let pagination
        //order
        const order = {  
          orderBy: [
          {
            createdAt: 'desc',
          }
        ]}
        const timeFilter ={
            AND: [{ date: { gt: from } }, { date: { lt: to } }],
        }
        
        if(isExcel){
          pagination = {}
        }else{
          pagination = {
            skip: (index)*limit,
            take :(index+1)*limit,
          }
        }
        const select ={ 
          ...pagination,
          select: {
            id:true,
            wallet:{
              select:{
                amount : true,
                merchant:{
                  select:{name:true,
                  mobile:true}
                }
              }
            },
            amount :true,
            date :true,
            resnum:true,
            rrn:true,
            traceNum: true,
            isPaid: true,
            securePan: true,
            createdAt:true,
            updatedAt:true,
          },
        }


        if(user.Role == "MERCHANT"){
          where = {
            merchantId : user.id  ,
            ...timeFilter
          }
          query  = {
            where :{
                merchantId : user.id  ,
                ...timeFilter
              },
              ...order,
              ...select
            } 
        }else{
           where = {
            ...timeFilter
          }
          query = {
            where :{
              ...timeFilter
            },
            ...order,
            ...select
          }
        }
      
        
        try{
          const count =  await this.prisma.walletTransaction.aggregate({
            where :{
              ...timeFilter
            },
            _count: {
              id: true,
            },
          })
          const walletTransaction = await this.prisma.walletTransaction.findMany(query);
          
          
          
          
          
          return {
            result : {
              data :walletTransaction,
              length : count._count.id,
              pageIndex : index ,
              pageSize : limit
            },
            status :true,
            statusCode :0
          }
        }catch(e){
          return {
            result : null,
            status :false,
            statusCode :0
          }
        }
        
      
      }
  
      async updateTransaction(
        id: string,
        dto: any,
      ) {
        // get the bookmark by id
        const walletTransaction =
          await this.prisma.walletTransaction.findUnique({
            where: {
              id: id,
            },
          });
  
        // check if user owns the bookmark
        if (!walletTransaction || walletTransaction.id !== id)
          throw new ForbiddenException(
            'Access to resources denied',
          );
  
        return this.prisma.walletTransaction.update({
          where: {
            id:id,
          },
          data: {
            ...dto,
          },
        });
      }


      async deleteTransaction(
        id: string,
      ) {
        const walletTransaction =
          await this.prisma.walletTransaction.findUnique({
            where: {
              id: id,
            },
          });
  
        // check if user owns the bookmark
        if (!walletTransaction || walletTransaction.id !== id)
          throw new ForbiddenException(
            'Access to resources denied',
          );
  
        await this.prisma.walletTransaction.delete({
          where: {
            id: id,
          },
        });
      }


      async getTransacrionByResNum(id: string) {

        return this.prisma.walletTransaction.findFirst({
          where: {
            resnum : id
          },
        });
      }

 }
