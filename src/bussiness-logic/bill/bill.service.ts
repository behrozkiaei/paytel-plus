import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderType } from 'src/utils/enums';
import {
    BillInquiryRepoInterface,
    BillInquiryResponseRepoInterface,
    BillPaymentRepoPayload,
    BillPaymentResponse,
    CheckBillRepoInterface,
    CheckBillRepoResponseInterface,
    PaymnetRemoteMethod,
    Paytype
} from 'src/utils/interfaces/bill.interfaces';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import {
    responseKeyToFaKey,
    responseValueToFaKey,
} from '../charge-internet/utils';
import { BillAmountInquiryDto, PayBillAuthed } from './dto/bill.dto';
import { PayBill } from './dto/pay-bill-no-auth.dto';
const moment = require('moment-jalaali');
@Injectable()
export class BillService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private authService: AuthService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
    private transactionService: TransactionsService,
  ) {}

  async billInquiryByPayIdAndBillIdNoAuth(
    dto: PayBill,
  ): Promise<INewResponseAPI<CheckBillRepoResponseInterface>> {
    try {
      let billCheck: CheckBillRepoInterface = {
        bill_id: dto.billId,
        pay_id: dto.payId.toString(),
      };
      const res = await this.requestToServiceProvider(
        PaymnetRemoteMethod.check_bill,
        billCheck,
      );
      if (res) {
        return {
          status: true,
          result: res,
        };
      } else {
        return {
          status: false,
          message: 'خطا در برقراری سرویس',
        };
      }
    } catch (e) {
      return {
        status: false,
        message: e.message ?? '',
      };
    }
  }
  async billIPaymentByPayIdAndBillIdNoAuth(
    dto: PayBill,
  ): Promise<INewResponseAPI<BillPaymentResponse>> {
    try {
      const order_id = Math.floor(Math.random() * 1000000000).toString();
      let billPayload: BillPaymentRepoPayload = {
        bill_id: dto.billId.toString(),
        pay_id: dto.payId,
        order_id: order_id, //شماره تراکنش در سایت شما (باید منحصر به فرد باشد)
        pay_type: Paytype.online,
        callback: this.config.get('FRONT_SERVER'),
      };
      const res = await this.requestToServiceProvider(
        PaymnetRemoteMethod.bill,
        billPayload,
      );
      if (res) {
        return {
          status: true,
          result: res,
        };
      } else {
        return {
          status: false,
          message: 'خطا در برقراری سرویس',
        };
      }
    } catch (e) {
      return {
        status: false,
        message: e.message ?? '',
      };
    }
  }

  //Authedd
  async inquiryBillAmount(
    user: any,
    dto: BillAmountInquiryDto,
  ): Promise<INewResponseAPI<BillInquiryResponseRepoInterface>> {
    try {
      const order_id = Math.floor(Math.random() * 1000000000).toString();
      const walletAmount = user.Wallet.amount;
      if (
        parseFloat(walletAmount) < -parseFloat(this.config.get('USER_MAX_DEBT'))
      ) {
        throw new Error('بدهی شما بیش از حد مجاز است');
      }
      //decre se user wallet amount
      const order = await this.orderMaker.makeOrder(
        OrderType.BILL_AMOUNT_INQUIRY_BY_CREDIT,
        user,
        dto,
      );
      
      
      let payload: BillInquiryRepoInterface = {

        bill_type: dto.bill_type ? dto.bill_type : undefined,
        //mobile inquiry
        mobile: user.mobile,
        operator: dto.operator ? dto.operator : undefined,
        period: dto.period ? dto.period : undefined,

        //phone inquiry
        phone: dto.phone ? dto.phone : undefined, //  فقط برای استعلام قبض تلفن اجباری
       
        //water - gas .... inquiry
        bill_id: dto.bill_id ? dto.bill_id : undefined, //فقط برای استعلام قبض آب و برق اجباری  - شناسه قبض (موجود بر روی قبض)
       
        //gaz inwuity
        participate_code: dto.participate_code ? dto.participate_code : undefined, //کد اشتراک کنتور گاز (موجود بر روی قبض)
       
        order_id,
      };
      const res : CheckBillRepoResponseInterface  = await this.requestToServiceProvider(
        PaymnetRemoteMethod.inquiry_bill,
        payload,
      );
      if (res && res?.code.toString() == "1") {
        await this.walletService.transferMoneyWallet2Wallet(
          null,
          user.Wallet.id,
          2000,
          'استعلام مبلغ قبض',
          order.id
        );
        const { code , msg ,...data } = res;
        await this.updateOrder(order.id, data, '');
        return {
          status: true,
          result: {
            orderId: order.id,
            ...res,
          },
        };
      } else {
       
        return {
          status: false,
          message: 'some thing went wrong',
        };
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? '',
      };
    }
  }

  async payBillWhenAuthedByPayIdAndBillId(
    user: any,
    dto: PayBillAuthed,
  ): Promise<INewResponseAPI<any>> {
    try {
      const type = dto.frmoWallet
        ? OrderType.BILL_PAYMENT_BY_WALLET
        : OrderType.BILL_PAYMENT_BY_CREDIT;
      const inquiry = await this.billInquiryByPayIdAndBillIdNoAuth({
        payId: dto.payId,
        billId: dto.billId,
      });
      if (!inquiry.status) {
        throw new Error('somethings wrronng');
      }
      let payload = {
        ...dto,
        amount: inquiry.result.amount,
      };
      const order = await this.orderMaker.makeOrder(type, user, payload);
      const order_id = Math.floor(Math.random() * 1000000000).toString();
      let billPayload: BillPaymentRepoPayload = {
        bill_id: dto.billId.toString(),
        pay_id: dto.payId,
        order_id: order_id, //شماره تراکنش در سایت شما (باید منحصر به فرد باشد)
        pay_type: dto.frmoWallet ? Paytype.credit : Paytype.online,
        callback: this.config.get('FRONT_SERVER'),
      };
      const res = await this.requestToServiceProvider(
        PaymnetRemoteMethod.bill,
        billPayload,
      );

      if (res && type == OrderType.BILL_PAYMENT_BY_CREDIT && res.url) {
        return {
          status: true,
          result: res,
        };
      } else if (
        res &&
        type == OrderType.BILL_PAYMENT_BY_WALLET &&
        res.ref_code
      ) {
        await this.walletService.transferMoneyWallet2Wallet(
          null,
          user.Wallet.id,
          inquiry.result.amount,
        );
        await this.updateOrder(order.id, res, '');
        return {
          status: true,
          result: {
            orderId: order.id,
          },
        };
      } else {
        return {
          status: false,
          message: 'خطا در برقراری سرویس',
        };
      }
    } catch (e) {
      return {
        status: false,
        message: e.message ?? '',
      };
    }
  }

  async requestToServiceProvider(
    method: string,
    payload: any = {},
  ): Promise<any> {
    const data = JSON.stringify({
      username: this.config.get('INAX_PASSWORD'),
      password: this.config.get('INAX_PASSWORD'),
      method: method,
      ...payload,
    });
    console.log(payload);
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://inax.ir/webservice.php',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    try {
      const response = await axios(config);
      if (response.status == 200) {
        return response.data;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);

      return false;
    }
  }
  async updateOrder(
    orderId: string,
    response: any,
    title: string,
  ): Promise<void> {
    let keyValueObj = [];
    if (!Array.isArray(response)) {
      for (let key in response) {
        keyValueObj.push({
          key: responseKeyToFaKey(key),
          value: responseValueToFaKey(key, response[key]),
          orderId: orderId,
          key_en: key,
        });
      }
    }
    let res: any;
    if (Array.isArray(response)) {
      for (let i = 0; i < response.length; i++) {
        res = response[i];
        for (let key in res) {
          keyValueObj.push({
            key: responseKeyToFaKey(key),
            value: responseValueToFaKey(key, res[key]),
            orderId: orderId,
            key_en: key,
          });
        }
        keyValueObj.push({
          key: 'separator',
          value: 'separator',
          orderId: orderId,
        });
      }
    }

    await this.prisma.keyValue.createMany({
      data: keyValueObj,
    });
    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        title: title,
        datePaid: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
        data1: JSON.stringify(response),
      },
    });
    return;
  }
}
