import { BankAccount, CheckPassDto, contacts, UpdateUser } from './dto/edit-user.dto';
/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { phoneNumberNormalizer, phoneNumberValidator } from '@persian-tools/persian-tools';
import { OrderType } from 'src/utils/enums';

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
        console.log(code);
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
          return{
            status:false,
            message: "user Not founded"
          }
        }


        const userInfo = await this.prisma.user.findUnique({
          where : {
            id: userWallet.User.id
          },
          select:{
            name : true,
            avatar : true,
            username : true,
            mobile :true,
          }
        })

        return{
          status : true,
          result : 
            { name : userInfo.name ?? "",
              avatar : userInfo.avatar ?? "" , 
              username :  userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
            },
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
              Wallet:true,
              fromUsers :
               {
                include :{
                  destUser :{
                    select:{
                      name:true,
                      avatar:true,
                      Wallet :{
                        select : {
                          walletCode:true,
                        }
                      }
                    }
                  }
                }
              }
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
    async uploadSelfieVideo(user,file){
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
              selfiVideo : `public/upload/${file.filename}`,
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
                nationalCode : dto.nationalCode ?? userInfo.nationalCode,
              }
            })
            return {
              status :true,
              result:null,
            }
      }catch(error){
        console.log(error);
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
  async checkPass(user:any,dto:CheckPassDto){
    try{

        const userInfo = await this.prisma.user.findUnique({where:{id : user.id}})
        const isMatch =  bcrypt.compareSync(dto.password,userInfo.password2)

        if(isMatch){
         await this.sendPushNotification('feAjpjCmQHiiZ2VbGi7RJW:APA91bEDqXX83Q5BQOY-a5r443ajNI8NCfgERkwcjl97fs9pTw_LsosTJKeZPso6a9tzljCQlMhIdPaS8dcTHC8opoNS29o2EpMc0WjI1X54XdnHAKfdRk6dXExFyEqa-2pG_Gu0LtI2',{'key':"velueee"})
        await   this.prisma.user.update({
            where :{id: user.id}, 
            data :{loginTime :  moment().format('jYYYY/jMM/jDD HH:mm:ss')}
          })
          return {
            status :true,
          }

        } else{
          console.log(222)
          throw Error("پسورد صحیح نیست")
        }
      
    }catch(e){
      return {
        status :false,
        message : e.message?? "مشکلی در ورود رخ داده است "
      }
    }
  }
  async sendPushNotification(deviceToken: string, data: any) {
    const message = {
      notification: {
        title: 'YOUR_NOTIFICATION_TITLE',
        body: 'YOUR_NOTIFICATION_BODY',
      },
      data: data,
      token: deviceToken,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }


  async findMutualFriends(user ,list:contacts[]): Promise<INewResponseAPI<any>>{
    try{
      const listOfNormalNumbers =[]
      for await (const item of list){
        if(phoneNumberValidator(item.phones)){
          let temp = item.phones.replace(" ","")
           temp = temp.replace("+98", "0");
           const mobile = phoneNumberNormalizer(temp , '0');
          listOfNormalNumbers.push({
            phone: mobile,
            name : item.name,
          });
        }
      }
      console.log(listOfNormalNumbers);
      const mutuals = await this.prisma.user.findMany({
        where : {
          mobile : {
            in : listOfNormalNumbers.map(item => item.phone)
          }
        },
        select : {
          Wallet : {
            select : {
              walletCode:true,
            }
          },
          avatar: true,
          name : true,
          mobile:true,
        },
      })
      // console.log(mutuals)

    const mutualUsers = mutuals.map(mutual=>{
      const findIn = listOfNormalNumbers.find(item =>item.phone == mutual.mobile)
      // console.log(findIn);
      if(findIn){
        mutual.name = findIn.name;
        return mutual;
      } 
    })
    return {
      status : true, 
      result :mutualUsers
    }
  }catch(e){
    console.log(e)
    return {
      status:false,
      message: 'somethings went wrong!'
    }
  }
}



  
}