import { ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';
const moment = require('moment-jalaali');

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
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
        _count: {
          id: true,
        },
      });
      const order = await this.prisma.order.findMany({
        where: {
          isPaid: true,
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

  async handleCallbackTest() {
    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          securePan: 'A00000000000000000000000000410663385',
        },
        include: {
          wallet: true,
          order: true,
        },
      });
      const order = await this.prisma.order.findUnique({
        where: { id: transaction.order.id },
        include: {
          desc: true,
        },
      });
      console.log(order.desc);
      return {
        status: true,
        message: 'تراکنش موفق',
        result: { desc: order.desc, Amount: transaction.amount + '' },
      };
    } catch (e) {
      console.log(e);
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
        const transaction = await this.prisma.transaction.findFirst({
          where: {
            securePan: query.Authority,
          },
          include: {
            wallet: true,
            order: true,
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
          console.log(7);
          // if transaction is increse my wallet acount balance
          if (transaction.wallet) {
            const masterWallet = await this.walletService.getWalletByType(
              'MASTER',
            );
            if (!masterWallet) {
              throw new Error('err');
            }
            const transfer =
              await this.walletService.transferMoneyWallet2Wallet(
                masterWallet.id,
                transaction.wallet.id,
                transaction.amount,
                'تراکنش بانکی',
              );
            if (!transfer) {
              throw new Error('err');
            }
          }

          //the transaction is buying a product or service
          if (!transaction.wallet) {
            //now if is the order to be done for user it should be done now
            //now if is the order to be done for user it should be done now
            //now if is the order to be done for user it should be done now
            //now if is the order to be done for user it should be done now
          }

          await this.prisma.order.update({
            where: {
              id: transaction.order.id,
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
                ],
              },
            },
          });
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
}
