import { User } from '@prisma/client'
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import moment from 'moment-jalaali';
@Injectable()


export class UserService {
  constructor(private prisma: PrismaService) {}
  

    
  async editUser(
    userId: string,
    dto: EditUserDto,
  ) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.password;

    return user;
  }
  async getUserInfo(id){
    try{
      const userInfo = await this.prisma.user.findUnique({
        where : {
          id: id
        },
        include :{
          Wallet:true
        }
      })

      return{
        status : true,
        result : userInfo,
        statusCode : 0,
      }
    }catch(e){
      return {result : false}
    }
  }
  async getMe(user:any){
    try{

        const userInfo = await this.prisma.user.findUnique({
          where : {
            id: user.id
          },
          include :{
            Wallet:
              { include :{
                  destWallet:true
                }
              },
              paymentRequest :{
                orderBy : {updatedAt :'desc'}
              },
            
          },
        
        })

        return{
          status : true,
          result : userInfo,
          statusCode : 0,
        }
    }catch(e){
      return {result : false}
    }
  }

    async uploadAvatar(user,file){
      try{

          const userInfo = await this.prisma.user.findUnique({
              where:{
                id : user.id
              }
          })

          if(!userInfo){
            return {
              status : false,
              message:"User not found"
            }
          }
          await this.prisma.user.update({
            where:{
              id :userInfo.id
            },
            data :{
              avatar : file.filename
            }
          })
          return {
            status :true,
            result:null,
          }
    }catch(error){

          return {
            status:false
          }
          
    }
  }
  
}