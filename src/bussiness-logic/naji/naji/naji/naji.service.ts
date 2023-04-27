import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { phoneNumberNormalizer } from '@persian-tools/persian-tools';
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
  VerifyUserNajiDto,
  plateDto,
} from './dto/naji.dto';
const moment = require('moment-jalaali');
@Injectable()
export class NajiService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: ConfigService,
    private authService: AuthService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
    private transactionService: TransactionsService,
  ) {}

  async verifyOtp(dto: VerifyUserNajiDto) {
    try {
      const configData = await this.prisma.config.findFirst();
      const mobileEn = toEn(phoneNumberNormalizer(dto.mobile, '0'));
      if (!configData.naji_token) {
        throw new Error('Naji havnt access token');
      }
      let data = qs.stringify({
        nationalCode: dto.nationalCode,
        mobile: mobileEn,
        otp: dto.otp,
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/initial-register`,
        headers: {
          Authorization: configData.naji_token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };
      try {
        const response = await axios.request(config);
        let user = await this.authService.findUserByPhone(mobileEn);
        if (!user) {
          user = await this.authService.createWalletIfUserNotExist(mobileEn);
        }
        this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            najiId: response.data.userId,
            name: response.data.firstName + ' ' + response.data.lastName,
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

  //get userId
  async sendOtp(mobile, nationalCode: string) {
    try {
      const mobileEn = toEn(phoneNumberNormalizer(mobile, '0'));
      const configData = await this.prisma.config.findFirst();
      if (!configData.naji_token) {
        throw new Error('Naji havnt access token');
      }
      let data = qs.stringify({
        nationalCode,
        mobile: mobileEn,
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/initial-register`,
        headers: {
          Authorization: configData.naji_token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          return {
            status: true,
          };
        })
        .catch((error) => {
          console.log(error);
          throw new Error('کد ملی با شماره موبایل شما مطابقت ندارد');
        });
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
      let data = qs.stringify({
        client_id: this.config.get('NAJI_CLIENT_ID'),
        client_secret: this.config.get('NAJI_SECRET'),
        grant_type: 'client_credentials',
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_AUTH_URL')}connect/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      };

      axios
        .request(config)
        .then((response) => {
          const result = response.data.access_token;
          this.prisma.config.update({
            where: {},
            data: {
              naji_token: result,
            },
          });
          return {
            status: true,
          };
        })
        .catch((error) => {
          throw new Error('not get token');
        });
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'Something goes wrong',
      };
    }
  }

  async driverLicense(user): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.DRIVING_LICENSE);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/driving-licenses`,
        headers: {
          Authorization: configData.naji_token,
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
        element.rahvarStatus = this.licensStatus(element.rahvarStatus);
        return element;
      });
      const data = qs.stringify(response);
      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.DRIVING_LICENSE,
      );

      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
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
    driverLicenseNumber,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.NEGETIVE_POINT);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}/naji/users/${
          user.najiId
        }/drivinglicenses/${driverLicenseNumber}/negative-point`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.NEGETIVE_POINT,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async activePlate(user): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.ACTIVE_PLATES);

      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/license-plates`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.ACTIVE_PLATES,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async getPassportStatus(user): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.PASSPORT_STATUS);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/passport/status`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.PASSPORT_STATUS,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
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
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.COUNTRY_LEAVING);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/Country-Leaving-permission
          s`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.COUNTRY_LEAVING,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
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
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.VIOLATION_REPORT);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const plate = await this.getPlateById(plateId);
      if (!plate || !plate.status) {
        throw new Error('Plate not exist');
      }

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/vehicles/${plate.result.license}/violations`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.VIOLATION_REPORT,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async violationImage(
    user,
    plateId,
    violationId,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const plate = await this.getPlateById(plateId);
      const price = this.getServicePrice(NajiType.VIOLATION_IMAGE);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      if (!plate || !plate.status) {
        throw new Error('Plate not exist');
      }

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/vehicles/${plate.result.license}/violations/${violationId}/images`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.VIOLATION_IMAGE,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
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
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.VIOLATION_AGGREGATE);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const plate = await this.getPlateById(plateId);
      if (!plate || !plate.status) {
        throw new Error('Plate not exist');
      }

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/vehicles/${plate.result.license}/violations/aggregate`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.VIOLATION_AGGREGATE,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  async getAggregateViolationReportWhitoutRegisteration(
    user: any,
    plateId: string,
    dto: AggregateViolationReportWhitoutRegisterationDto,
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const plate = await this.getPlateById(plateId);
      const configData = await this.prisma.config.findFirst();

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/vehicle/${
          plate.result.license
        }/violations/aggregate?nationalCode=${dto.nationalCode}&cellphoone=${
          dto.mobile
        }`,
        headers: {
          Authorization: configData.naji_token,
        },
      };

      const result = await axios(config);
      if (result.status != 200) {
        throw new Error('inquiry faild ');
      }
      const response: ViolationAggregateReportInterface = result.data;

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.VIOLATION_AGGREGATE_NO_AUTH,
      );
      if (!inquiry.status) {
        throw new Error('Not saved inquiry in databse');
      }
      return {
        status: true,
        result: {
          id: inquiry.result.id,
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
  ): Promise<INewResponseAPI<najiResponseId>> {
    try {
      const configData = await this.prisma.config.findFirst();
      const price = this.getServicePrice(NajiType.DRIVING_LICENSE);
      if (price > +user.wallet.amount) {
        return { status: false, message: 'amonut is not enough' };
      }
      const plate = await this.getPlateById(plateId);
      if (!plate || !plate.status) {
        throw new Error('Plate not exist');
      }

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${this.config.get('SHIRAD_API_URL')}naji/users/${
          user.najiId
        }/vehicles/${plate.result.license}`,
        headers: {
          Authorization: configData.naji_token,
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

      const data = qs.stringify(response);

      const inquiry = await this.createInquiry(
        user,
        data,
        NajiType.COUNTRY_LEAVING,
      );
      if (!inquiry.result) {
        throw new Error('inqury not saved in db');
      }
      return {
        status: true,
        result: {
          id: inquiry.result ? inquiry.result.id : '',
        },
      };
    } catch (error) {
      return {
        status: false,
      };
    }
  }

  //   internal

  async createInquiry(user, data, type) {
    try {
      const inquiry = await this.prisma.najiInquiryResult.create({
        data: {
          date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          type: type,
          data: data,
          userId: user.id,
        },
      });
      return {
        status: true,
        result: inquiry,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
      };
    }
  }

  licensStatus(statusCode) {
    switch (statusCode) {
      case 21:
        return 'قبول آزمون تئوری';
        break;
      case 31:
        return 'قبول آزمون عملی';
        break;
      case 41:
        return 'تائید دفتر/آموزشگاه';
        break;
      case 61:
        return 'قبول آزمون فنی';
        break;
      case 71:
        return 'قبول آزمون تپه';
        break;
      case 101:
        return 'رد شده کاردان فنی';
        break;
      case 111:
        return 'منوط به نظر کاردان فنی';
        break;
      case 22:
        return 'تایید شده راهور';
        break;
      case 32:
        return 'رد شده راهور';
        break;
      case 62:
        return 'چاپ شده';
        break;
      case 72:
        return 'نقش چاپ / عکس';
        break;
      case 102:
        return 'اسکن شده ناجی پاس';
        break;
      case 172:
        return 'پیدا شده';
        break;
      case 182:
        return 'برگشتی از پست';
        break;
      case 262:
        return 'چاپ مجدد';
        break;
      case 272:
        return 'چاپ مجدد راهور';
        break;
      case 282:
        return 'چاپ ویژه';
        break;

      default:
        break;
    }
  }
  plateChartoDigit(char) {
    switch (char) {
      case 'ب':
        return '02';
        break;
      case 'ت':
        return '03';
        break;
      case 'ج':
        return '04';
        break;
      case 'د':
        return '05';
        break;
      case 'س':
        return '06';
        break;
      case 'ص':
        return '07';
        break;
      case 'ط':
        return '08';
        break;
      case 'ع':
        return '09';
        break;
      case 'ق':
        return '10';
        break;
      case 'ل':
        return '11';
        break;
      case 'م':
        return '12';
        break;
      case 'ن':
        return '13';
        break;
      case 'و':
        return '14';
        break;
      case 'ه':
        return '15';
        break;
      case 'ی':
        return '16';
        break;
      case 'ژ':
        return '19';
        break;

      default:
        break;
    }
  }

  async addPlate(user, dto: plateDto) {
    try {
      const plate = await this.prisma.plate.create({
        data: {
          userId: user.id,
          plateType: dto.type == 'MOTOR' ? PlateType.MOTOR : PlateType.CAR,
          firstPart: dto.firstPart,
          secondPart: dto.secondPart,
          countryPart: dto.charPart,
          charPart: dto.countryPart,
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
  async getPlates(user, dto: plateDto) {
    try {
      const plates = await this.prisma.plate.findFirst({
        where: {
          userId: user.id,
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
      //if there is not any related inquiry
      const inquiry = await this.getPlatesInquiry(plateId);
      if (inquiry.status && inquiry.result?.length > 0) {
        return {
          status: false,
          message: 'این پلاک قابل حذف نیست',
        };
      }
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
  async getPlatesInquiry(plateId) {
    try {
      const paltesInquiry = await this.prisma.najiInquiryResult.findMany({
        where: {
          plateId: plateId,
        },
      });
      return {
        status: true,
        result: paltesInquiry,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
      };
    }
  }
  async getPlateById(id) {
    try {
      let plate = await this.prisma.plate.findUnique({
        where: {
          id: id,
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
  makePlateLicens(plate) {
    try {
      let license = '';
      if (plate.type == PlateType.CAR) {
        const charDigit = this.plateChartoDigit(plate.char);
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
    return 51000;
  }

  async makeorder(dto: any, type: NajiType, user) {
    const order = await this.orderMaker.makeOrder(
      dto.fromWallet
        ? OrderType.najiInquiryByWallet
        : OrderType.najiInquiryByCredit,
      user,
      {
        ...dto,
        type: type,
      },
    );

    return order;
  }
  async createNajiTransaction(userId, orderId, price) {
    const res = await this.walletService.createTransaction(
      userId,
      price,
      orderId,
      `${this.config.get('SERVER_ADDRESS')}/naji/callback`,
    );
    return res;
  }
  async handleCallback(query) {
    await this.transactionService.handleCallback(query);
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        securePan: query.Authority,
      },
      include: {
        wallet: true,
        order: true,
      },
    });
    const dto = qs.parse(transaction.order.payload);
    const user = await this.prisma.user.findUnique({
      where: {
        id: transaction.order.userId,
      },
    });
    let res;
    switch (dto.type) {
      case NajiType.ACTIVE_PLATES:
        res = await this.activePlate(user);
        return res;
        break;
      case NajiType.DOCUMENT_STATUS:
        res = await this.documentStatus(user, dto.plateId);
        return res;

        break;
      case NajiType.NEGETIVE_POINT:
        res = await this.negetivePoint(user, dto.driverLicenseNumber);
        return res;
        break;
      case NajiType.VIOLATION_AGGREGATE:
        res = await this.getViolationReport(user, dto.plateId);
        return res;
        break;
      case NajiType.VIOLATION_AGGREGATE_NO_AUTH:
        const { plateId, ...payload } = dto;
        res = await this.getAggregateViolationReportWhitoutRegisteration(
          user,
          plateId as string,
          payload as unknown as AggregateViolationReportWhitoutRegisterationDto,
        );
        return res;

        break;
      case NajiType.COUNTRY_LEAVING:
        res = await this.getCountryLeavingStatus(user);
        return res;
        break;
      case NajiType.DRIVING_LICENSE:
        res = await this.driverLicense(user);
        return res;
        break;
      case NajiType.PASSPORT_STATUS:
        res = await this.getPassportStatus(user);
        return res;
        break;
      case NajiType.VIOLATION_IMAGE:
        res = await this.violationImage(user, dto.plateId, dto.violationId);
        return res;

        break;
      case NajiType.VIOLATION_REPORT:
        res = await this.getViolationReport(user, dto.plateId);
        return res;
        break;
      default:
        break;
    }
  }
  async registerUserAndPlate(
    dto: AggregateViolationReportWhitoutRegisterationDto,
  ) {
    const mobileEn = toEn(phoneNumberNormalizer(dto.mobile, '0'));
    let user = await this.authService.findUserByPhone(dto.mobile);
    if (!user) {
      user = await this.authService.createWalletIfUserNotExist(mobileEn);
    }
    const configData = await this.prisma.config.findFirst();
    const res = await this.addPlate(user, dto);
    if (!res.status) {
      throw new Error('not added plate');
    }
    const plate = await this.getPlateById(res.result.id);
    if (!plate || !plate.status) {
      throw new Error('Plate not exist');
    }
    return { user, plate: plate.result };
  }
}
