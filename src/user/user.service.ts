import { User } from '@prisma/client'
/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
const  moment = require('moment-jalaali')
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
  async getUserInfoByWalletCode(code){
    try{

      const userWallet =await this.prisma.wallet.findFirst({
        where: {
           walletCode  :code,
         },
         select:{
          User : {select: {
            id : true
            }
          }
         }
      })
      if(!userWallet){
        throw new ForbiddenException("User Not Founded")
      }


      const userInfo = await this.prisma.user.findUnique({
        where : {
          id: userWallet.User.id
        },
        select:{
          name : true,
          avatar : true,
          username : true,
        }
      })

      return{
        status : true,
        result : userInfo,
        statusCode : 0,
      }
    }catch(e){
      console.log(e)
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
          },
        })
        return{
          status : true,
          result : userInfo,
          statusCode : 0,
        }
    }catch(e){
      console.log(e)
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