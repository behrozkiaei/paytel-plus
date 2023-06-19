import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  digitsFaToEn,
  phoneNumberNormalizer,
} from '@persian-tools/persian-tools';
import axios from 'axios';
import qs from 'qs';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NajiType, OrderType, PlateType } from 'src/utils/enums';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { toEn } from 'src/utils/toEn';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import {
  ActivePlateResponseInterface,
  CountryLeavingReponseInterface,
  DocumentStatusInterface,
  LicensesReponsetype,
  NegetiveLicenseResponse,
  PassportStatusIntrerface,
  ViolationAggregateReportInterface,
  ViolationTypeResponseInterface,
  najiResponseId,
  violationImageReponseInterface,
} from '../models/naji.model';
import {
  AggregateViolationReportWhitoutRegisterationDto,
  DriverNajiDto,
  MobileAndNationalDto,
  MobileDto,
  NegeticvePoint,
  VerifyUserNajiDto,
  plateDto,
} from './dto/naji.dto';
import {
  licensStatus,
  plateChartoDigit,
  responseKeyToFaKey,
  responseValueToFaKey,
} from './util/responseTofa';
import { isObject } from 'class-validator';
import { urlencoded } from 'body-parser';
const moment = require('moment-jalaali');
@Injectable()
export class NajiService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private authService: AuthService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
    private transactionService: TransactionsService,
  ) {}

  async verifyOtpWhenUserisLogein(user, dto: VerifyUserNajiDto) {
    try {
      const configData = await this.getNajiToken();
      const mobileEn = toEn(phoneNumberNormalizer(dto.mobile, '0'));
      if (!configData.naji_token) {
        throw new Error('Naji havnt access token');
      }
      const data = JSON.stringify({
        nationalCode: dto.nationalCode,
        mobile: mobileEn,
        otp: dto.otp,
      });
      // console.log(data)
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
          'Content-Type': undefined,
        },
        data: data,
      };
      console.log(config);
      try {
        const response = await axios.request(config);
        if (response.status != 200) {
          return {
            status: false,
            message: 'user not registered',
          };
        }
        console.log(response.data);
        const najiUserIfExist = await this.myNajiUsersByMobileAndNAtional(
          user,
          { mobile: dto.mobile, nationalCode: dto.nationalCode },
        );

        if (najiUserIfExist.status && najiUserIfExist.result) {
          await this.prisma.najiUser.updateMany({
            where: {
              mobile: phoneNumberNormalizer(digitsFaToEn(dto.mobile), '0'),
              nationalCode: dto.nationalCode,
              user: {
                id: user.id,
              },
            },
            data: {
              najiId: response.data.userId,
              nationalCodeVerified: true,
              name: response.data.firstName + ' ' + response.data.lastName,
            },
          });
        } else {
          await this.prisma.najiUser.create({
            data: {
              najiId: response.data.userId,
              date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
              nationalCode: dto.nationalCode,
              nationalCodeVerified: true,
              mobile: dto.mobile,
              userId: user.id,
              name: response.data.firstName + ' ' + response.data.lastName,
            },
          });
        }

        // const token = await this.authService.signToken(user.id);
        return {
          status: true,
        };
      } catch (e) {
        console.log(e);
        return {
          status: false,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'Some thing went wrong',
      };
    }
  }

  //get userId
  async sendOtpWhenUserisLogein(user, dto: any) {
    try {
      const mobileEn = toEn(phoneNumberNormalizer(dto.mobile, '0'));
      const configData = await this.getNajiToken();
      console.log(configData);
      if (!configData.naji_token) {
        throw new Error('Naji havnt access token');
      }
      const data = JSON.stringify({
        nationalCode: dto.nationalCode,
        mobile: mobileEn,
      });
      // console.log(data)
      axios.defaults.headers.post['Content-Type'] = undefined;
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/initial-register`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
          'Content-Type': 'application/json', 
        },
        data: data,
      };

      const response = await axios.request(config);
      console.log(response)

      if (response.status == 200) {
        return {
          status: true,
        };
      } else {
        return {
          status: false,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'Some thing went wrong',
      };
    }
  }

  //get userId
  async sendOtpWhenNotAppAuth(mobile, nationalCode: string) {
    try {
      const mobileEn = toEn(phoneNumberNormalizer(mobile, '0'));
      const configData = await this.getNajiToken();
      if (!configData.naji_token) {
        throw new Error('Naji havnt access token');
      }
      const data = {
        nationalCode,
        mobile: mobileEn,
      };

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/initial-register`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
          'Content-Type': undefined,
        },
        data: data,
      };

      const response = await axios.request(config);

      if (response.status == 200) {
        return {
          status: true,
        };
      } else {
        return {
          status: false,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'Some thing went wrong',
      };
    }
  }

  async verifyOtpWhenNotAppAuth(dto: VerifyUserNajiDto) {
    try {
      const configData = await this.getNajiToken();
      const mobileEn = toEn(phoneNumberNormalizer(dto.mobile, '0'));
      if (!configData.naji_token) {
        throw new Error('Naji havent access token');
      }
      const data = {
        nationalCode: dto.nationalCode,
        mobile: mobileEn,
        otp: dto.otp,
      };

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/initial-register`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
          'Content-Type': undefined,
        },
        data: data,
      };
      try {
        const response = await axios.request(config);

        let user = await this.authService.findUserByPhone(mobileEn);
        if (!user) {
          user = await this.authService.createWalletIfUserNotExist(mobileEn);
        }

        this.prisma.najiUser.create({
          data: {
            najiId: response.data.userId,
            date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
            nationalCode: dto.nationalCode,
            nationalCodeVerified: true,
            userId: user.id,
          },
        });
        const token = await this.authService.signToken(user.id);
        return {
          result: {
            otpType: null,
            token: token.access_token ?? null,
          },
          status: true,
        };
      } catch (e) {
        console.log(e);
        return {
          status: false,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'Some thing went wrong',
      };
    }
  }
  //get tnaji token
  async getNajiToken() {
    try {
      const configData = await this.prisma.config.findFirst({});

      if (configData && configData.naji_token) {
        const end = moment().format('jYYYY/jMM/jDD HH:mm:ss');
        const duration = moment(end, 'jYYYY/jMM/jDD HH:mm:ss').diff(
          moment(configData.naji_token_date, 'jYYYY/jMM/jDD HH:mm:ss'),
          'minutes',
        );
        if (duration < 55) {
          return {
            naji_token: configData.naji_token,
          };
        }
      }
      const data = {
        client_id: this.config.get('NAJI_CLIENT_ID'),
        client_secret: this.config.get('NAJI_SECRET'),
        grant_type: 'client_credentials',
      };

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_AUTH_URL')}connect/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };

      const response = await axios.request(config);

      const result = response.data.access_token;
      // console.log(result);
      await this.prisma.config.update({
        where: {
          id: configData.id,
        },
        data: {
          naji_token: result,
          naji_token_date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
        },
      });

      return {
        naji_token: result,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'Something goes wrong',
      };
    }
  }

  async driverLicense(
    user,
    dto: DriverNajiDto,
    orderId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.DRIVING_LICENSE);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          dto.najiId
        }/driving-licenses`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const response: LicensesReponsetype[] = result.data;

      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );

      response.map((element) => {
        element.rahvarStatus = licensStatus(element.rahvarStatus);
        return element;
      });

      await this.updateOrder(orderId, response, 'استعلام گوهینامه');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: error.message ?? 'خطا در انجام عملیات',
      };
    }
  }

  async negetivePoint(
    user,
    dto: NegeticvePoint,
    orderId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.NEGETIVE_POINT);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      console.log(`${this.config.get('SHIRAD_API_URL')}naji/users/${
        dto.najiId
      }/drivinglicenses/${dto.driverLicenseNumber}/negative-point`)
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: encodeURI(`${this.config.get('SHIRAD_API_URL')}naji/users/${
          dto.najiId
        }/driving-licenses/${dto.driverLicenseNumber}/negative-point`),
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const response: NegetiveLicenseResponse = result.data;
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );
      await this.updateOrder(orderId, response, 'استعلام نمره منفی راننده');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      console.log(error)
      return {
        status: false,
      };
    }
  }

  async activePlate(
    user,
    orderId,
    dto: DriverNajiDto,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.ACTIVE_PLATES);

      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          dto.najiId
        }/license-plates`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );
      const response: ActivePlateResponseInterface[] = result.data;

      const data = JSON.stringify(response);

      await this.updateOrder(orderId, response, 'استعلام پلاک فعال');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async getPassportStatus(
    user,
    orderId,
    dto: DriverNajiDto,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.PASSPORT_STATUS);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          dto.najiId
        }/passport/status`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );

      const response: PassportStatusIntrerface = result.data;

      const data = JSON.stringify(response);

      await this.updateOrder(orderId, response, 'استعلام وضعیت پاسپورت');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async getCountryLeavingStatus(
    user,
    orderId,
    dto: DriverNajiDto,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.COUNTRY_LEAVING);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      console.log(`${this.config.get('SHIRAD_API_URL')}naji/users/${
        dto.najiId
      }/country-leaving-permission`)
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: encodeURI(`${this.config.get('SHIRAD_API_URL')}naji/users/${
          dto.najiId
        }/country-leaving-permission`),
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );

      const response: CountryLeavingReponseInterface = result.data;

      const data = JSON.stringify(response);

      await this.updateOrder(orderId, response, 'استعلام وضعیت خروج از کشور');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async getViolationReport(
    user,
    plateId,
    orderId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.VIOLATION_REPORT);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const plateRes = await this.getPlateById(plateId);
      if (!plateRes || !plateRes.status) {
        throw new Error('Plate not exist');
      }

      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          plateRes.result.naji.najiId
        }/vehicles/${plateRes.result.license}/violations/report`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );

      const response: ViolationTypeResponseInterface = result.data;

      const data = JSON.stringify(response);

      await this.updateOrder(orderId, response, 'استعلام تخلفات رانندگی');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
      };
    }
  }

  async violationImage(
    user,
    plateId,
    violationId,
    orderId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const plate = await this.getPlateById(plateId);
      const price = this.getServicePrice(NajiType.VIOLATION_IMAGE);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      if (!plate || !plate.status) {
        throw new Error('Plate not exist');
      }

      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          plate.result.naji.najiId
        }/vehicles/${plate.result.license}/violations/${violationId}/images`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );

      const response: violationImageReponseInterface = result.data;

      const data = JSON.stringify(response);

      await this.updateOrder(orderId, response, 'استعلام تصویر تخلف');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async getAggregateViolationReport(
    user,
    plateId,
    orderId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.VIOLATION_AGGREGATE);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const plate = await this.getPlateById(plateId);
      if (!plate || !plate.status) {
        throw new Error('Plate not exist');
      }

      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          plate.result.naji.najiId
        }/vehicles/${plate.result.license}/violations/aggregate`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );

      const response: ViolationAggregateReportInterface = result.data;

      await this.updateOrder(orderId, response, 'استعلام تخلفات تجمیعی');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      console.log(error)
      return {
        status: false,
      };
    }
  }

  async getAggregateViolationReportWhitoutRegisteration(
    user: any,
    plateId: string,
    dto: AggregateViolationReportWhitoutRegisterationDto,
    orderId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const plate = await this.getPlateById(plateId);
      const configData = await this.getNajiToken();

      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/vehicle/${
          plate.result.license
        }/violations/aggregate?nationalCode=${dto.nationalCode}&cellphoone=${
          dto.mobile
        }`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const response: ViolationAggregateReportInterface = result.data;

      const data = JSON.stringify(response);
      await this.updateOrder(orderId, response, 'استعلام تخلفات تجمیعی');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async documentStatus(
    user,
    plateId,
    orderId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.getNajiToken();
      const price = this.getServicePrice(NajiType.DRIVING_LICENSE);
      if (price > +user.Wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const plate = await this.getPlateById(plateId);
      if (!plate || !plate.status) {
        throw new Error('Plate not exist');
      }

      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          plate.result.naji.najiId
        }/vehicles/${plate.result.license}/documents/status`,
        headers: {
          Authorization: 'Bearer ' + configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const masterWalletRes = await this.walletService.getMasterWallet();
      await this.walletService.transferMoneyWallet2Wallet(
        user.Wallet.id,
        masterWalletRes.id,
        price,
        'انتقال برای استعلام ',
      );

      const response: DocumentStatusInterface = result.data;

      await this.updateOrder(orderId, response, 'استعلام وضعیت کار ماشین');
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { desc: true },
      });
      return {
        status: true,
        message: 'تراکنش موفق',
        result: {
          id: orderId,
          desc: order.desc,
          Amount: order.amount.toString(),
          order: order,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async addPlate(
    dto: plateDto | AggregateViolationReportWhitoutRegisterationDto,
    najiId: string,
  ) {
    try {
      let license;
      if (dto.type == 'CAR') {
        const charDigit = plateChartoDigit(dto.charPart);
        license = `${dto.countryPart}${charDigit}${dto.firstPart}${dto.secondPart}`;
      }
      if (dto.type == 'MOTOR') {
        license = `08${dto.firstPart}${dto.secondPart}000`;
      }
      const plate = await this.prisma.plate.create({
        data: {
          najiId: najiId,
          plateType: dto.type == 'MOTOR' ? PlateType.MOTOR : PlateType.CAR,
          firstPart: dto.firstPart,
          secondPart: dto.secondPart,
          countryPart: dto.countryPart,
          charPart: dto.charPart,
          license: license,
          date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
        },
      });
      return {
        status: true,
        result: plate,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: 'error ',
      };
    }
  }
  async getPlates(user) {
    try {
      const plates = await this.prisma.plate.findMany({
        where: {
          naji: {
            user: {
              id: user.id,
            },
          },
        },
        include: {
          naji: true,
        },
      });
      return {
        status: true,
        result: plates,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: 'error ',
      };
    }
  }
  async removePlate(user, plateId) {
    try {
      await this.prisma.plate.delete({
        where: {
          id: plateId,
        },
      });
      return {
        status: true,
      };
    } catch {}
  }

  async getPlateById(id) {
    try {
      let plate = await this.prisma.plate.findUnique({
        where: {
          id: id,
        },
        include: {
          naji: true,
        },
      });
      if (!plate) {
        return {
          status: false,
          message: 'Plate not exist',
        };
      }
      if (!plate.license) {
        const res = this.makePlateLicens(plate);
        if (res.status && res.result) {
          this.prisma.plate.update({
            where: {
              id: plate.id,
            },
            data: {
              license: res.result,
            },
          });
        }
        plate = await this.prisma.plate.findUnique({
          where: {
            id: id,
          },
          include: {
            naji: true,
          },
        });
      }
      return {
        status: true,
        result: plate,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
      };
    }
  }

  async getPlateByInfo(user, dto: plateDto) {
    try {
      let plate = await this.prisma.plate.findFirst({
        where: {
          naji: {
            userId: user.id,
          },
          firstPart: dto.firstPart,
          secondPart: dto.secondPart,
          charPart: dto.charPart,
          countryPart: dto.countryPart,
        },
        include: {
          naji: true,
        },
      });
      if (!plate) {
        return {
          status: false,
          message: 'Plate not exist',
        };
      }
      return {
        status: true,
        result: plate,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
      };
    }
  }
  makePlateLicens(plate) {
    try {
      let license = '';
      if (plate.type == PlateType.CAR) {
        const charDigit = plateChartoDigit(plate.char);
        license = `${plate.countryPart}${charDigit}${plate.firstPart}${plate.secondPart}`;
      }
      if (plate.type == PlateType.MOTOR) {
        license = `08${plate.firstPart}${plate.secondPart}000`;
      }

      return {
        status: true,
        result: license,
      };
    } catch (e) {
      return {
        status: false,
      };
    }
  }

  getServicePrice(type: NajiType): number {
    return 10000;
  }

  async makeorder(dto: any, type: OrderType, user) {
    try {
      const order = await this.orderMaker.makeOrder(type, user, {
        ...dto,
        type: type,
      });

      return order;
    } catch (e) {
      console.log(e);
      throw new Error('Some thing went wrong');
    }
  }
  async createNajiTransaction(userId, orderId, price) {
    const res = await this.walletService.createTransaction(
      userId,
      price,
      orderId,
      `${this.config.get('SERVER_ADDRESS')}/naji-callback/callback`,
    );
    return res;
  }
  async handleCallback(query) {
    console.log('callbak controller service naji');
    const callbackers = await this.transactionService.handleCallback(query);
    console.log('call back transaction service handled');
    console.log(callbackers);
    if (!callbackers.status) {
      return {
        status: false,
        message: 'transaction verify failed',
      };
    }
    console.log(15);
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        securePan: query.Authority,
      },
      include: {
        wallet: true,
        order: true,
      },
    });
    console.log(16);
    const dto = JSON.parse(transaction.order.payload);
    const user = await this.prisma.user.findUnique({
      where: {
        id: transaction.order.userId,
      },
      include: {
        Wallet: true,
      },
    });
    let res: INewResponseAPI<najiResponseId>;
    console.log(transaction.order.type);
    switch (transaction.order.type) {
      case 'ACTIVE_PLATES_BY_CREDIT':
        res = await this.activePlate(
          user,
          transaction.order.id,
          dto as unknown as DriverNajiDto,
        );
        break;
      case 'DOCUMENT_STATUS_BY_CREDIT':
        res = await this.documentStatus(
          user,
          dto.plateId,
          transaction.order.id,
        );

        break;
      case 'NEGETIVE_POINT_BY_CREDIT':
        res = await this.negetivePoint(
          user,
          dto as unknown as NegeticvePoint,
          transaction.order.id,
        );
        break;
      case 'VIOLATION_AGGREGATE_BY_CREDIT':
        res = await this.getAggregateViolationReport(
          user,
          dto.plateId,
          transaction.order.id,
        );
        break;
      case 'VIOLATION_AGGREGATE_NO_AUTH_BY_CREDIT':
        const { plateId, ...payload } = dto;
        res = await this.getAggregateViolationReportWhitoutRegisteration(
          user,
          plateId as string,
          payload as unknown as AggregateViolationReportWhitoutRegisterationDto,
          transaction.order.id,
        );

        break;
      case 'COUNTRY_LEAVING_BY_CREDIT':
        res = await this.getCountryLeavingStatus(
          user,
          transaction.order.id,
          dto as unknown as DriverNajiDto,
        );
        break;
      case 'DRIVING_LICENSE_BY_CREDIT':
        res = await this.driverLicense(
          user,
          dto as unknown as DriverNajiDto,
          transaction.order.id,
        );
        break;
      case 'PASSPORT_STATUS_BY_CREDIT':
        res = await this.getPassportStatus(
          user,
          transaction.order.id,
          dto as unknown as DriverNajiDto,
        );
        break;
      case 'VIOLATION_IMAGE_BY_CREDIT':
        res = await this.violationImage(
          user,
          dto.plateId,
          dto.violationId,
          transaction.order.id,
        );

        break;
      case 'VIOLATION_REPORT_BY_CREDIT':
        res = await this.getViolationReport(
          user,
          dto.plateId,
          transaction.order.id,
        );
        break;
      default:
        break;
    }
    return {
      url: `${this.config.get('FRONT_SERVER')}/receipt/?id=${
        transaction.order.id
      }`,
      RedirectURL: `${this.config.get('FRONT_SERVER')}/receipt/?id=${
        transaction.order.id
      }`,
      statusCode: 302,
    };
  }
  async registerNajiAndPlate(
    user: any,
    dto: AggregateViolationReportWhitoutRegisterationDto,
  ) {
    const configData = await this.getNajiToken();
    const najiUser = await this.prisma.najiUser.create({
      data: {
        userId: user.id,
        date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
        mobile: dto.mobile,
      },
    });
    const res = await this.addPlate(dto, najiUser.id);
    if (!res.status) {
      throw new Error('not added plate');
    }
    const resPlate = await this.getPlateById(res.result.id);
    if (!resPlate || !resPlate.status) {
      throw new Error('Plate not exist');
    }
    return { plate: resPlate.result };
  }

  async getMyNajiUser(user) {
    try {
      const najiUsers = await this.prisma.najiUser.findMany({
        where: {
          user: {
            id: user.id,
          },
        },
      });
      return {
        status: true,
        result: najiUsers,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: 'error ',
      };
    }
  }

  async myNajiUsersByNationalCode(
    user,
    dto: any,
  ): Promise<INewResponseAPI<any>> {
    try {
      const najiUser = await this.prisma.najiUser.findFirst({
        where: {
          nationalCode: digitsFaToEn(dto.nationalCode),
          user: {
            id: user.id,
          },
        },
      });
      return {
        status: true,
        result: najiUser,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: 'error ',
      };
    }
  }
  async myNajiUsersByMobile(
    user,
    dto: MobileDto,
  ): Promise<INewResponseAPI<any>> {
    try {
      const najiUser = await this.prisma.najiUser.findFirst({
        where: {
          mobile: phoneNumberNormalizer(digitsFaToEn(dto.mobile), '0'),
          user: {
            id: user.id,
          },
        },
      });
      return {
        status: true,
        result: najiUser,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: 'error ',
      };
    }
  }
  async myNajiUsersByMobileAndNAtional(
    user,
    dto: MobileAndNationalDto,
  ): Promise<INewResponseAPI<any>> {
    try {
      const najiUser = await this.prisma.najiUser.findFirst({
        where: {
          mobile: phoneNumberNormalizer(digitsFaToEn(dto.mobile), '0'),
          nationalCode: dto.nationalCode,
          userId: user.id,
        },
      });

      return {
        status: najiUser ? true : false,
        result: najiUser ?? undefined,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: 'error ',
      };
    }
  }

  async updateOrder(
    orderId: string,
    data: any,
    title: string,
  ): Promise<boolean> {
    console.log('here');
    let keyValueObj = [];
    const response = this.flattenObject(data);
    console.log(response);
    for (let i = 0; i < response.length; i++) {
      keyValueObj.push({
        key: responseKeyToFaKey(response[i].key),
        value: responseValueToFaKey(
          response[i].key,
          response[i].value.toString(),
        ),
        orderId: orderId,
        key_en: response[i].key,
        value_en: response[i].value.toString(),
      });
    }
    console.log(keyValueObj.length);
    await Promise.all([
      this.prisma.keyValue.createMany({
        data: keyValueObj,
      }),
      this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
          title: title,
          datePaid: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          data1: JSON.stringify(data),
        },
      }),
    ]);
    return true;
  }

  flattenObject(obj: any) {
    const result: any[] = [];
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          // console.log(obj[key])
          const temp = this.flattenObject(obj[key]);
          for (const innerKey in temp) {
            result.push({ key: `${innerKey}`, value: temp[innerKey] });
          }
        } else if (Array.isArray(obj[key])) {
          for (const element of obj[key]) {
            result.push({ key: 'separator', value: '3-4' });
            const temp = this.flattenObject(element);
            for (const innerKey in temp) {
              if (
                typeof temp[innerKey].value === 'object' &&
                !Array.isArray(temp[innerKey].value)
              ) {
                result.push({
                  key: `${temp[innerKey].value.key}`,
                  value: temp[innerKey].value.value,
                });
              } else if (Array.isArray(temp[innerKey].value)) {
              } else {
                result.push({
                  key: `${temp[innerKey].key}`,
                  value: temp[innerKey].value,
                });
              }
            }
          }
        } else {
          result.push({ key: key, value: obj[key] });
        }
      }
    }else if (Array.isArray(obj)) {
      for (const element of obj) {
        const temp = this.flattenObject(element);
        for (const innerKey in temp) {
          if (
            typeof temp[innerKey].value === 'object' &&
            !Array.isArray(temp[innerKey].value)
          ) {
            result.push({
              key: `${temp[innerKey].value.key}`,
              value: temp[innerKey].value.value,
            });
          } else if (Array.isArray(temp[innerKey].value)) {
          } else {
            result.push({
              key: `${temp[innerKey].key}`,
              value: temp[innerKey].value,
            });
          }
        }
        result.push({ key: 'separator', value: 'separator' });
      }
    }
    return result;
  }
}
