import { BankAccount, UpdateUser } from './dto/edit-user.dto';
/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
            Wallet:true,
            order : {
              orderBy  : {
                createdAt : "desc",
              },
              take: 10,
            } 
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
  

  // updateIndentityImage
  async updateIdentityImage(user:any,url :string){
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
            shenasname :url
          }
        })
        return {
          status :true,
          result: url,
        }
  }catch(error){

        return {
          status:false
        }
        
  }
}
// updateAvatarImage
async updateAvatar(user:any,url :string){
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
          avatar :url
        }
      })
      return {
        status :true,
        result: url,
      }
}catch(error){

      return {
        status:false
      }
      
}
}
  // updateNationalCardImage
  async updateNationalCardImage(user:any,url:string){
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
            cartMelli :url
          }
        })
        return {
          result: url,
          status :true,
        }
  }catch(error){

        return {
          status:false
        }
        
  }
}
  // updatename
  async updatename(user:any,dto:UpdateUser){
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
            cartMelli : dto.name
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
    // updateUsername
    async updateUser(user:any,dto:UpdateUser){
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
              username : dto.username ?? userInfo.username,
              name  : dto.name ?? userInfo.username,
              address : dto.address ?? userInfo.address,
              description : dto.description ?? userInfo.description,
              email: dto.email ?? userInfo.email,
              lat : dto.lat ?? userInfo.lat,
              lan : dto.lan ?? userInfo.lan,
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

  //update bank acount
  async updateBankAccount(user:any,dto:BankAccount){
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
            card : dto.card,
            sheba : dto.sheba,
            verified_bank :false
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

async convertBase64toImage(base64:string): Promise<string>{
     const base64Image = base64;
    const imageName = uuidv4() + '.png';
    const imagePath = path.join('public/upload', imageName);
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(imagePath, base64Data, 'base64');

    const url = `public/upload/${imageName}`; // Change this to your own URL
    return url;
}
}