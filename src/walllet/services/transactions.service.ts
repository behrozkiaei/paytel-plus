import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
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
      if (error instanceof PrismaClientKnownRequestError) {
        return { message: error.message };
      }
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
  async getAllOrders(user, from = 0, take = 10){
    try {
      const count = await this.prisma.order.aggregate({
        _count: {
          id: true,
        },
      });
      const order = await this.prisma.order.findMany({
        skip: +from,
        take: +take,
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
    // get the bookmark by id
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: id,
      },
    });

    // check if user owns the bookmark
    if (!transaction || transaction.id !== id)
      throw new ForbiddenException('Access to resources denied');

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
    if (query.Status != 'Ok') {
      return {
        status: false,
      };
    } else if (query.Status == 'Ok') {
      try {
        const transaction = await this.prisma.transaction.findFirst({
          where: {
            securePan: query.authority.toString(),
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

        if (transaction.isPaid == true) {
          return { result: {}, status: false, message: 'تراکنش منقضی شده است' };
        }

        if (query.Status != 'OK') {
          await this.updateTransaction(transaction.id, {
            isPaid: false,
          });
          return { status: false, message: query.Status };
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

        if (response.data.data > 100) {
          this.updateTransaction(transaction.id, {
            isPaid: true,
          });

          // if transaction is increse my wallet acount balance
          if (transaction.wallet) {
            // const masterWallet = await this.walletService.getWalletByType(
            //   'MASTER',
            // );
            // if (!masterWallet) {
            //   throw new Error('err');
            // }
            // const transfer =
            // await this.walletService.transferMoneyWallet2Wallet(
            //   masterWallet.id,
            //   transaction.wallet.id,
            //   transaction.amount,
            //   'تراکنش بانکی',
            // );
            // if (!transfer) {
            //   throw new Error('err');
            // }
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
            },
          });
          return {
            status: true,
            result: {
              ...transaction,
            },
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
        return { status: false, message: 'تراکنش ناموفق بود' };
      }
    }
  }
}
