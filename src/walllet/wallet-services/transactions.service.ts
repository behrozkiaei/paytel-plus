import { User } from 'src/auth/decorator/user.decorator';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { OrderType } from 'src/utils/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';
import {
  InternetProducts,
  internetPayloadForRequest,
} from 'src/utils/interfaces/internet-products-model';
import { OrderMakerService } from './order-maker.service';
import { InternetDto, chargeDto } from 'src/walllet/dto/internet.dto';
import { ServicesService } from '../../bussiness-logic/charge-internet/services.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment-jalaali');

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private OrderMakerService: OrderMakerService,
    private services: ServicesService,
  ) {}

  async createTransaction(dto: any) {
    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          ...dto,
          date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
        },
      });
      return { ...transaction };
    } catch (error) {
      throw error;
    }
  }

  async getTransactionById(id: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: {
          id,
        },
        include: {
          order: true,
          wallet: true,
        },
      });
      if (transaction) {
        return transaction;
      } else {
        return null;
      }
    } catch (e) {
      return false;
    }
  }

  async getAllTransaction(
    user,
    index = 1,
    limit = 10,
    from = '0',
    to = '99999999999999',
    isExcel = false,
  ) {
    let query;
    let where;
    let pagination;
    //order
    const order = {
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    };
    const timeFilter = {
      AND: [{ date: { gt: from } }, { date: { lt: to } }],
    };

    if (isExcel) {
      pagination = {};
    } else {
      pagination = {
        skip: index * limit,
        take: (index + 1) * limit,
      };
    }
    const select = {
      ...pagination,
      select: {
        id: true,
        wallet: {
          select: {
            amount: true,
            merchant: {
              select: { name: true, mobile: true },
            },
          },
        },
        amount: true,
        date: true,
        resnum: true,
        rrn: true,
        traceNum: true,
        isPaid: true,
        securePan: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    if (user.Role == 'MERCHANT') {
      where = {
        merchantId: user.id,
        ...timeFilter,
      };
      query = {
        where: {
          merchantId: user.id,
          ...timeFilter,
        },
        ...order,
        ...select,
      };
    } else {
      where = {
        ...timeFilter,
      };
      query = {
        where: {
          ...timeFilter,
        },
        ...order,
        ...select,
      };
    }

    try {
      const count = await this.prisma.transaction.aggregate({
        where: {
          ...timeFilter,
        },
        _count: {
          id: true,
        },
      });
      const transaction = await this.prisma.transaction.findMany(query);
      return {
        result: {
          data: transaction,
          length: count._count.id,
          pageIndex: index,
          pageSize: limit,
        },
        status: true,
        statusCode: 0,
      };
    } catch (e) {
      return {
        result: null,
        status: false,
        statusCode: 0,
      };
    }
  }
  async getAllOrders(user, from = 0, take = 10) {
    try {
      const count = await this.prisma.order.aggregate({
        where:{
          isPaid: true,
          userId:user.id
        },
        _count: {
          id: true,
        },
      });
      const order = await this.prisma.order.findMany({
        where: {
          isPaid: true,
          userId:user.id
        },
        skip: +from,
        take: +take,
        include: {
          desc: true,
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });
      console.log({
        result: {
          data: order,
          length: count._count.id,
        },
        status: true,
        statusCode: 0,
      });
      return {
        result: {
          data: order,
          length: count._count.id,
        },
        status: true,
        statusCode: 0,
      };
    } catch (e) {
      return {
        result: null,
        status: false,
        statusCode: 0,
      };
    }
  }
  async updateTransaction(id: string, dto: any) {
    try {
      await this.prisma.transaction.update({
        where: {
          id: id,
        },
        data: {
          ...dto,
        },
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async deleteTransaction(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: id,
      },
    });

    // check if user owns the bookmark
    if (!transaction || transaction.id !== id)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.transaction.delete({
      where: {
        id: id,
      },
    });
    return true;
  }
  async getTransacrionByResNum(id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        resnum: id,
      },
    });
    if (transaction) {
      return transaction;
    } else {
      return null;
    }
  }
  async getTransacrionBySecurePan(securePan: string) {
    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          securePan: securePan,
        },
        include: {
          order: true,
        },
      });
      if (transaction) {
        return transaction;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  async handleCallback(query: any) {
    console.log(query);
    if (query.Status != 'OK') {
      return {
        status: false,
      };
    } else if (query.Status == 'OK') {
      try {
        console.log(1);
        console.log(query.Authority);
        const transaction = await this.prisma.transaction.findFirst({
          where: {
            securePan: query.Authority,
          },
          include: {
            wallet: true,
            order: {
              include: { desc: true },
            },
          },
        });
        if (!transaction)
          return {
            status: false,
            message: 'چنین تراکنش وجود ندارد',
          };

        console.log(transaction);
        if (transaction.isPaid == true) {
          return { result: {}, status: false, message: 'تراکنش منقضی شده است' };
        }

        const data = JSON.stringify({
          merchant_id: 'da506228-c225-431c-91ff-ddc4abe8b995',
          amount: transaction.amount,
          authority: transaction.securePan,
        });

        const configuration = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://api.zarinpal.com/pg/v4/payment/verify.json',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          data: data,
        };

        const response = await axios(configuration);
        console.log(response.data.data);
        if (
          response?.data?.data?.code == 100 ||
          response?.data?.data?.code == 101
        ) {
          await this.updateTransaction(transaction.id, {
            isPaid: true,
            card_pan: response.data.data.card_pan,
            ref_id: response.data.data.ref_id,
            fee_type: response.data.data.fee_type,
            fee: response.data.data.fee,
          });
          const res = await this.transferBaseOnOrderAndTransaction(transaction.order.id);
          if(!res.status){
            throw Error("increase error")
          }
          if (transaction.order?.type == OrderType.increaseWallet) {
            await this.increaseAmountOrderUpdate(transaction.order.id, response);
          }

          if (transaction.order?.type == OrderType.creditToOtherWallet) {
            await this.updateTransactionDataInOrder(transaction.order.id, response);
            await this.walletService.doingTransferWhenAmountIsEnough(transaction.order.id);
          }

          if (transaction.order?.type == OrderType.internetByCredit) {
            return await this.buyInternetAndWalletTransfer(transaction.order.id);
          }
          if (transaction.order?.type == OrderType.chargeByCredit) {
            return await this.buyChargeAndWalletTransfer(transaction.order.id);
          }
          const order = await this.prisma.order.findUnique({
            where: { id: transaction.order.id },
            include: {
              desc: true,
            },
          });
          return {
            status: true,
            message: 'تراکنش موفق',
            result: { desc: order.desc, Amount: transaction.amount },
          };
        } else {
          return {
            status: false,
            result: {
              ...transaction,
            },
          };
        }
      } catch (e) {
        console.log(e);
        return { status: false, message: 'تراکنش ناموفق بود' };
      }
    }
  }

  async buyInternet(
    user: any,
    dto: InternetDto,
  ): Promise<INewResponseAPI<any>> {
    try {
      const product = await this.prisma.internetProduct.findFirst({
        where: {
          product_id: dto.product_id,
        },
      });
      const payload: InternetProducts = {
        ...dto,
        amount: product.amount,
        internet_type: product.internet_type,
        name: product.name,
      };
      const type = dto.fromWallet
        ? OrderType.internetByWallet
        : OrderType.internetByCredit;
      const order = await this.OrderMakerService.makeOrder(type, user, payload);

      if (type == OrderType.internetByCredit) {
        const transaction = await this.walletService.createTransaction(
          user.id,
          product.amount,
          order.id,
        );
        return { ...transaction };
      }
      return await this.buyInternetAndWalletTransfer(order.id);
    } catch (e) {
      return {
        status: false,
        message: e.message ?? 'مشکل در برقرای سرویس',
      };
    }
  }

  async buyCharge(user: any, dto: chargeDto): Promise<INewResponseAPI<any>> {
    try {
      const type = dto.fromWallet
        ? OrderType.chargeByWallet
        : OrderType.chargeByCredit;
      const order = await this.OrderMakerService.makeOrder(type, user, dto);

      if (type == OrderType.chargeByCredit) {
        const transaction = await this.walletService.createTransaction(
          user.id,
          dto.amount,
          order.id,
        );
        return { ...transaction };
      }
      return await this.buyChargeAndWalletTransfer(order.id);
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'مشکل در برقرای سرویس',
      };
    }
  }

  async buyChargeAndWalletTransfer(orderId): Promise<INewResponseAPI<any>> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      const userInfo = await this.prisma.user.findUnique({
        where: { id: order.userId },
        include: { Wallet: true },
      });
      const dto: chargeDto = JSON.parse(order.payload);
      if (+userInfo?.Wallet?.amount < +dto?.amount) {
        throw Error('موجودی شما کافی نیست');
      }
      const master = await this.walletService.getMasterWallet();
      //try to transmit user wallet amount
      const transferResult =
        await this.walletService.transferMoneyWallet2Wallet(
          userInfo.Wallet.id,
          master.id,
          dto.amount,
          'تراکنش خرید شارژ',
        );
      if (!transferResult) {
        throw Error('متاسفانه انتقال اعتبار ناموفق بود');
      }
      const buyCharge = await this.services.buyCharge(order.id);
      console.log(1);
      if (!buyCharge.status) {
        await this.walletService.transferMoneyWallet2Wallet(
          master.id,
          userInfo.Wallet.id,
          dto.amount,
          'ناموفق- بازگشت پول - تراکنش خرید شارژ',
        );
        throw Error(buyCharge.message ?? 'متاسفانه انتقال اعتبار ناموفق بود');
      }
      console.log(2);
      const payload = JSON.parse(order.payload);
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          isPaid: true,
          date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          payload: JSON.stringify({
            ...payload,
            trans_id: buyCharge.result.trans_id,
          }),
          desc: {
            create: [
              {
                key: 'تاریخ',
                value: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
              },
              {
                key: 'موبایل',
                value: dto.mobile,
              },
              {
                key: 'شماره پیگیری',
                value: buyCharge.result.ref_code.toString(),
              },
            ],
          },
        },
      });
      return { ...buyCharge };
    } catch (e) {
      return {
        status: false,
        message: e.message ?? 'مشکل در برقراری سرویس رخ داده است',
      };
    }
  }

  async buyInternetAndWalletTransfer(orderId) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { orderId: orderId },
      });
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: { include: { Wallet: true } } },
      });
      const masterWallet = await this.walletService.getWalletByType('MASTER');
      if (!masterWallet) {
        throw new Error('err');
      }
      const dto: InternetProducts = JSON.parse(order.payload);
    
      const buyInternet = await this.services.buyInternet(order.id);

      if (!buyInternet.status) {
        const transfer = await this.walletService.transferMoneyWallet2Wallet(
          masterWallet.id,
          order.user.Wallet.id,
          dto.amount,
          'برگشت اعتبار تراکنش خرید اینترنت ',
        );
        if (!transfer.status) {
          throw new Error('err');
        }
        return {
          ...buyInternet,
        };
      }
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          isPaid: true,
          payload: JSON.stringify({
            ...dto,
            trans_id: buyInternet.result.trans_id.toString(),
            ref: buyInternet.result.ref_code.toString(),
          }),
          desc: {
            create: [
              {
                key: 'نام بسته',
                value: dto.name,
              },
              {
                key: 'تاریخ',
                value: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
              },
              {
                key: 'شماره',
                value: dto.mobile,
              },
              {
                key: 'شماره پیگیری',
                value: buyInternet.result.ref_code.toString(),
              },
            ],
          },
        },
      });
      return { ...buyInternet };
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message ?? 'مشکل در برقراری سرویس رخ داده است',
      };
    }
  }

  async increaseAmountOrderUpdate(orderId, response) {
    try {
   
      const transaction = await this.prisma.transaction.findUnique({
        where: { orderId: orderId },
      });
      await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          isPaid: true,
          datePaid: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          desc: {
            create: [
              {
                key: 'شماره کارت',
                value: response.data.data.card_pan.toString(),
              },
              {
                key: 'شماره تراکنش',
                value: response.data.data.ref_id.toString(),
              },
              {
                key: 'کد رهگیری',
                value: transaction.resnum,
              },
              {
                key: 'تاریخ',
                value: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
              },
            ],
          },
        },
      });
      return {
        status: true,
      };
    } catch (e) {
      return {
        status: false,
      };
    }
  }

  async updateTransactionDataInOrder(orderId, response) {
    try{
      const transaction = await this.prisma.transaction.findUnique({
        where: { orderId: orderId },
      });
      await this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          isPaid: false,
          datePaid: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
          desc: {
            create: [
              {
                key: 'شماره کارت',
                value: response.data.data.card_pan.toString(),
              },
              {
                key: 'شماره تراکنش',
                value: response.data.data.ref_id.toString(),
              },
              {
                key: 'کد رهگیری',
                value: transaction.resnum,
              },
              {
                key: 'تاریخ',
                value: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
              },
            ],
          },
        },
      });
    
      
      return {
        status :true
      }
  }catch(e){
   return {
     status :false
   }
  }
  }


  async transferBaseOnOrderAndTransaction (orderId){
    try{

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: { include: { Wallet: true } } },
      });
      const transaction = await this.prisma.transaction.findUnique({
        where: { orderId: orderId },
      });
      const masterWallet = await this.walletService.getWalletByType('MASTER');
      if (!masterWallet) {
        throw new Error('err');
      }
      const transfer = await this.walletService.transferMoneyWallet2Wallet(
        masterWallet.id,
        order.user.Wallet.id,
        transaction.amount,
        'تراکنش بانکی',
      );
      if (!transfer.status) {
        throw new Error('err');
      }
      return{
        status:true,
      }
    }catch(e){
      return {
        status : false,
      }
    }
  }

}
