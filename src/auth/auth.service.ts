import { Role } from './../utils/enums';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateUserDto } from './dto/create-user.dto';
import { SendOtp } from './dto/auth.dto';
import {
  phoneNumberNormalizer,
  phoneNumberValidator,
} from '@persian-tools/persian-tools';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { toEn } from '../utils/toEn';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { sendMessage } from '../utils/sendMessage';
import moment from 'moment-jalaali';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async createMerchant(dto: CreateUserDto) {
    if (!phoneNumberValidator(dto.mobile)) {
      throw new ForbiddenException('Phone is not valid');
    }
    try {
      const password = (Math.floor(Math.random() * 9000) + 1000).toString();
      let user = await this.findUserByPhone(dto.mobile);
      if (user) {
        throw new ForbiddenException('Phone number registered before');
      }
      user = await this.prisma.user.create({
        data: {
          ...dto,
          role: Role.LEVEL1,
          phone: toEn(dto.mobile),
          mobile: toEn(dto.mobile),
          date: moment().format('jYYYY/jMM/jDD'),
          password: '',
        },
      });
      await this.prisma.wallet.create({
        data: {
          userId: user.id,
          date: moment().format('jYYYY/jMM/jDD'),
          walletType: Role.LEVEL1,
          amount: 0,
        },
      });

      return { status: true, stasusCode: 0, result: true };
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        return {
          statusCode: 1,
          status: false,
          message: 'error',
        };
      }
      throw error;
    }
  }

  async findUserByPhone(phoneNumber) {
    try {
      return this.prisma.user.findUnique({
        where: {
          mobile: toEn(phoneNumber),
        },
      });
    } catch (error) {
      return false;
    }
  }
  async sendOtp(dto: SendOtp) {
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
      const msg = `Hi-kish password : ${password}`;
      const mobile2Send = user.mobile.startsWith('0')
        ? user.mobile.substring(1)
        : user.mobile;
      const config = await this.prisma.config.findFirst({});
      const res = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: password,
        },
      });

      // await sendMessage(mobile2Send, password);
      return {
        result: {
          mobile: mobile,
        },
        message: 'رمز یک بار مصرف ارسال شد',
        stausCode: 0,
        status: true,
      };
    } catch (e) {
      console.log(e);
      return {
        result: null,
        status: false,
        statusCode: 1,
        message: e.message || 'Something goes wrong...!',
      };
    }
  }
  async signin(dto: AuthDto) {
    try {
      // find the user by email
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
      if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

      const token = await this.signToken(user.id, user.email);
      return { result: token, status: true, stausCode: 0 };
    } catch (e) {
      console.log(e);
      return {
        result: null,
        status: false,
        statusCode: 1,
        message: 'Something goes wrong...!',
      };
    }
  }
  async verifyOtp(dto: AuthDto) {
    // find the user by email
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
      if (!pwMatches) throw new ForbiddenException('Password not mached');
      return {
        result: true,
      };
    } catch (e) {
      return {
        result: false,
        message: 'Something goes wrong!',
      };
    }
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
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

  async sendVerification(phone_number, verification_code) {
    try {
      const config = await this.prisma.config.findFirst({});
      // send sms
    } catch (e) {
      return false;
    }
  }
}
