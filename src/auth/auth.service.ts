import { OtpType } from 'src/utils/enums';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  phoneNumberNormalizer,
  phoneNumberValidator,
} from '@persian-tools/persian-tools';
import { PrismaService } from '../prisma/prisma.service';
import { toEn } from '../utils/toEn';
import { AuthDto } from './dto';
import { SendOtp } from './dto/auth.dto';
import { LoginUserDto, sendOtpDto, verifyOtpDto } from './dto/create-user.dto';
// import { sendMessage } from '../utils/sendMessage';
// eslint-disable-next-line @typescript-eslint/no-var-requires, prettier/prettier
const  moment = require('moment-jalaali')
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginUserDto) {
    if (!phoneNumberValidator(dto.mobile)) {
      throw new ForbiddenException('Phone is not valid');
    }
    const mobile = toEn(phoneNumberNormalizer(dto.mobile, '0'));
    try {
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
            walletCode: lastWallet.walletCode + 1,
          },
        });
      }

      if (!user.active) throw new ForbiddenException('اکانت شما  فعال  نیست');
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: '1234' || password,
          otpDate: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          otpType: OtpType.Login,
        },
      });
      // wait send message to user

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
          password: '1234' || password,
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
      console.log(e);
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
      let token;
      if (user.otpType == OtpType.Login) {
        token = await this.signToken(user.id);
      }
      return {
        result: {
          otpType: user.otpType,
          token: token ?? null,
        },
        status: true,
      };
    } catch (e) {
      console.log(e);
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
}
