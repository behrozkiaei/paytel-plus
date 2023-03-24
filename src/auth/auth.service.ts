import { CACHE_MANAGER, ForbiddenException, Injectable,Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  phoneNumberNormalizer,
  phoneNumberValidator
} from '@persian-tools/persian-tools';
import * as admin from 'firebase-admin';

import { createDecipheriv } from 'crypto';
import { Cache } from 'cache-manager';
import { OtpType } from 'src/utils/enums';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { toEn } from '../utils/toEn';
import { SmsService } from './../utils/sms_handler';
import { LoginUserDto, sendOtpDto, verifyOtpDto } from './dto/create-user.dto';
import { SetPassDto } from './dto/set-pass.dto';
import * as bcrypt from 'bcrypt';
// import { sendMessage } from '../utils/sendMessage';
// eslint-disable-next-line @typescript-eslint/no-var-requires, prettier/prettier
const  moment = require('moment-jalaali')
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private smsService :SmsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(dto: LoginUserDto) {
    if (!phoneNumberValidator(dto.mobile)) {
      throw new ForbiddenException('Phone is not valid');
    }
    const mobile = toEn(phoneNumberNormalizer(dto.mobile, '0'));
    try {
      // const password ="1234" || (Math.floor(Math.random() * 9000) + 1000).toString();
      const password = (Math.floor(Math.random() * 9000) + 1000).toString();
      let user = await this.findUserByPhone(mobile);
      if (!user) {
        //throw new ForbiddenException('Phone number registered before');
        user = await this.prisma.user.create({
          data: {
            phone: mobile,
            mobile: mobile,
            date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
            password: password,
            active: true,
          },
        });
        const lastWallet = await this.prisma.wallet.findFirst({
          orderBy: {
            date: 'desc',
          },
        });

        await this.prisma.wallet.create({
          data: {
            userId: user.id,
            date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
            amount: 0,
            walletCode: lastWallet?.walletCode + 1 || '100000',
          },
        });
      }

      if (!user.active) throw new ForbiddenException('اکانت شما  فعال  نیست');
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: password,
          otpDate: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          otpType: dto.otpType ?? OtpType.Login,
        },
      });
      // wait send message to user
      await this.smsService.sendOtp(user.mobile, password);
      // wait send message to user
        
      return { status: true, stasusCode: 0, result: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findUserByPhone(phoneNumber) {
    try {
      return this.prisma.user.findFirst({
        where: {
          mobile: toEn(phoneNumberNormalizer(phoneNumber, '0')),
        },
      });
    } catch (error) {
      return false;
    }
  }
  async sendOtp(dto: sendOtpDto) {
    if (!phoneNumberValidator(dto.mobile)) {
      throw new ForbiddenException('Phone is not valid');
    }
    const mobile = toEn(dto.mobile);
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          mobile: mobile,
        },
      });
      // if user does not exist throw exception

      if (!user) throw new ForbiddenException('Credentials incorrect');
      if (!user.active)
        throw new ForbiddenException('اکانت شما هنوز فعال نشده است');
      const password =
        '1111' || (Math.floor(Math.random() * 9000) + 1000).toString();

      // await sendMessage(mobile2Send, password);
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: password,
          otpDate: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          otpType: dto.otpType,
        },
      });
      return {
        result: {
          mobile: mobile,
        },
        message: 'رمز یک بار مصرف ارسال شد',
        statusCode: 0,
        status: true,
      };
    } catch (e) {
      return {
        result: null,
        status: false,
        statusCode: 1,
        message: e.message || 'Something goes wrong...!',
      };
    }
  }
  async verifyOtp(dto: verifyOtpDto) {
    // find the user
    if (!phoneNumberValidator(dto.mobile)) {
      throw new ForbiddenException('Phone is not valid');
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          mobile: dto.mobile,
        },
      });
      // if user does not exist throw exception
      if (!user) throw new ForbiddenException('Credentials incorrect');

      // compare password
      const pwMatches = user.password == dto.password ? true : false;
      // if password incorrect throw exception
      if (!pwMatches) throw new ForbiddenException('Password not matched');

      const end = moment().format('jYYYY/jMM/jDD HH:mm:ss');
      const duration = moment(end, 'jYYYY/jMM/jDD HH:mm:ss').diff(
        moment(user.otpDate, 'jYYYY/jMM/jDD HH:mm:ss'),
        'minutes',
      );
      const dif = moment.duration(duration, 'minutes').asMinutes();
      if (dif > 3) {
        throw new ForbiddenException('Otp Expired');
      }
  
      const uid =    uuidv4();
      await this.cacheManager.set(
        user.id.toString(),
        uid,
        3 * 60*1000,
      );
       
      if(dto.fcmToken){
        await this.saveFcmToken(dto,user.id);
      }
      if( !user.password2 ){
        return {
          result: {
            otpType: OtpType.RessetPass,
            token: null,
            uid : uid,
            userId: user.id
          },
          status: true,
        };
      }
       if(user.otpType == OtpType.RessetPass ){
 
        return {
          result: {
            otpType: OtpType.RessetPass,
            token: null,
            uid : uid,
            userId: user.id
          },
          status: true,
        };
      }  
      if (user.otpType == OtpType.Login) {
       const  token = await this.signToken(user.id);
        return {
          result: {
            otpType: user.otpType,
            token: token.access_token ?? null,
          },
          status: true,
        };
      }
    } catch (e) {
      return {
        result: false,
        message: e.message || 'Something goes wrong!',
      };
    }
  }

  async signToken(userId: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60d',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async sendVerification() {
    try {
      // send sms
    } catch (e) {
      return false;
    }
  }

  async setPassword(dto : SetPassDto) {
    try{

      const uuid = await this.cacheManager.get(dto.userId)
      console.log(uuid)
      console.log(uuid == dto.uid);
      if(!uuid ){
        throw Error('خطای ارسال از سمت کاربر')
      }
      if(uuid != dto.uid){
        throw Error('خطا در دریافت رمز')
      }
      const user = await this.prisma.user.findUnique({where:{id:dto.userId}});
     
      if(!user){
        throw Error('کاربر یافت نشد')
      }
      const saltOrRounds = 10;
      const salt = bcrypt.genSaltSync(saltOrRounds);
      const hash =  bcrypt.hashSync(dto.password, salt);
      console.log(hash)
      await this.prisma.user.update({where:{id:user.id},data:{password2 :hash }})
      const token = await this.signToken(user.id);

   
      return {
        result: {
          token: token.access_token ?? null,
        },
        status: true,
      };
    }catch(e){
      console.log(e)
      return {
        status:false,
        message :e.message ?? "خطا در ارسال رمز"
      }
    }
  }


 async saveFcmToken(dto:verifyOtpDto,id:string){
  return await this.prisma.user.update({
    where:{id:id},
    data:{
      fcmToken : dto.fcmToken 
    }
  })
 }
}
