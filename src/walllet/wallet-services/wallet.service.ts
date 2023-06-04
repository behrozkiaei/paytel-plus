import { InternetDto } from '../dto/internet.dto';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { UserTransferDto } from '../dto/transfer.dto';
import { UpdateWalletDto } from '../dto/update-wallet.dto';
/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { keyValue, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionsService } from './transactions.service';
import { TransferDto } from '../dto/transfer.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment-jalaali');
import axios from 'axios';
import { OrderType } from 'src/utils/enums';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService,private config : ConfigService) {}

  async getWalletById(id: string) {
    return this.prisma.wallet.findUnique({
      where: {
        id,
      },
    });
  }
  async getWalletByType(walletType: string) {
    return this.prisma.wallet.findFirst({
      where: {
        walletType,
      },
    });
  }
  async getWalletByUserId(id: string) {
    return this.prisma.wallet.findFirst({
      where: {
        userId: id,
      },
      include: {
        User: true,
      },
    });
  }

  async getAllWallet() {
    return await this.prisma.wallet.findMany();
  }

  async updateWallet(id: string, dto: UpdateWalletDto) {
    // get the bookmark by id
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id: id,
      },
    });

    // check if user owns the bookmark
    if (!wallet || wallet.id !== id)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.wallet.update({
      where: {
        id: id,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteWallet(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id: id,
      },
    });

    // check if user owns the bookmark
    if (!wallet || wallet.id !== id)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.wallet.delete({
      where: {
        id: id,
      },
    });
  }

  async customerPaymentRequest(user, amount, dto: PaymentRequestDto) {
    try {
      console.log(dto);
      const order = await this.prisma.order.create({
        data: {
          title: 'افزایش اعتبار',
          amount: +amount,
          type: OrderType.increaseWallet,
          userId: user.id,
          avatar: user.avatar,
          payload: JSON.stringify(dto),
          date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
        },
      });
      const res = await this.createTransaction(user.id, amount, order.id);
      if (res.status && res.result) {
        return {
          result: {
            RedirectURL: res.result.RedirectURL,
          },
          status: true,
          statusCode: 0,
        };
      }
    } catch (e) {
      return {
        result: null,
        statusCode: 1,
        status: false,
        message: 'Failed to insert data',
      };
    }
  }

  async transferMoneyWallet2Wallet(
    sourceWalletId  = null,
    destWalletId = null, 
    amount,
    desc = '',
    orderIdIsPaid = null
  ) {
    const date = moment().format('jYYYY/jMM/jDD HH:mm:ss');
    try {

      if(sourceWalletId == null || destWalletId==null){
        const masterWallet = await this.prisma.wallet.findFirst({
          where: {
            walletType: 'MASTER',
          },
          select: {
            id: true,
            amount: true,
            User: {
              select: {
                id: true,
              },
            },
          },
        });
        if (!masterWallet) {
          throw new ForbiddenException('Master wallet not founded');
        }
        if(sourceWalletId ==null){
          sourceWalletId = masterWallet.id
        }
        if(destWalletId ==null){
          destWalletId = masterWallet.id
        }
      }
      const sourceWallet = await this.prisma.wallet.findUnique({
        where: { id: sourceWalletId },
      });

      const destWallet = await this.prisma.wallet.findUnique({
        where: { id: destWalletId },
      });
      if (!destWallet) {
        throw new Error('ولت هدف پیدا نشد');
      }
      if (!sourceWallet) {
        throw new Error('ولت پیدا نشد');
      }
      // console.log(sourceWallet)
      if (+amount > +sourceWallet.amount) {
        throw new ForbiddenException('موجودی حساب شما کافی نیست');
      }
      await this.prisma.wallet.update({
        where: {
          id: sourceWalletId,
        },
        data: {
          amount: +sourceWallet.amount - +amount,
        },
      });

      await this.prisma.wallet.update({
        where: {
          id: destWalletId,
        },
        data: {
          amount: +destWallet.amount + +amount,
        },
      });

      await this.prisma.walletTransfer.create({
        data: {
          destWalletId: destWalletId,
          sourceWalletId: sourceWalletId,
          amount: +amount,
          date: date,
          description: desc,
        },
      });
      if(orderIdIsPaid){
        await this.prisma.order.update({
          where: { id: orderIdIsPaid},
          data: {
            isPaid: true,
          },
        });
      }
      return {
        status: true,
        result: null,
      };
    } catch (err) {
      console.log(err);
      return {
        status: false,
        result: null,
      };
    }
  }


  async transferByAdmin(dto: TransferDto) {
    const masterWallet = await this.prisma.wallet.findFirst({
      where: {
        walletType: 'MASTER',
      },
      select: {
        id: true,
        amount: true,
        User: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!masterWallet) {
      throw new ForbiddenException('Master wallet not founded');
    }

    const userWallet = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
      include: {
        Wallet: true,
      },
    });
    if (!userWallet || !userWallet.Wallet) {
      throw new ForbiddenException('Master wallet not founded');
    }
    if (dto.mode == 'increase') {
      try {
        return this.transferMoneyWallet2Wallet(
          masterWallet?.id,
          userWallet.Wallet.id,
          dto.amount,
          'افزایش اعتبار توسط ادمین',
        );
      } catch (e) {
        console.log(e);
        return {
          status: false,
          message: 'something wrong',
        };
      }
    }
    if (dto.mode == 'decrease') {
      try {
        return this.transferMoneyWallet2Wallet(
          userWallet.Wallet.id,
          masterWallet.id,
          dto.amount,
          'کاهش اعتبار توسط ادمین',
        );
      } catch (e) {
        console.log(e);
        return {
          status: false,
          message: 'something wrong',
        };
      }
    }
  }

  async transferByUser(user: any, dto: UserTransferDto) {
    console.log(dto); 
    try{

      const toWallet = await this.prisma.wallet.findFirst({
        where: {
        walletCode: dto.walletCode,
      },
      include: {
        User: true,
      },
    });
    if (!toWallet) {
      throw new ForbiddenException('Target User  wallet not founded');
    }
    await this.registerInLastPaidUsersDb(user.id, toWallet.User.id);
    const resnum = Date.now().toString();
    const order = await this.prisma.order.create({
      data: {
        title: ' انتقال اعتبار از کارت بانکی',
        amount: +dto.amount,
        type: dto.fromWallet
          ? OrderType.walletToWallet
          : OrderType.creditToOtherWallet,
        userId: user.id,
        subTitle:toWallet.User.name ? `${toWallet.User.name} انتقال به ` : `${toWallet.User.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")} انتقال به `,
        date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
        payload: JSON.stringify(dto),
        desc: {
          create: [
            // for update user push or update many  updateMany: [{where: { key: "key1" }, // update the record with key="key1" data: { value: "new_value1" } },
            {
              key: 'کد رهگیری',
              value: resnum,
            },
          ],
        },
      },
    });
      if (dto.fromWallet) {
       return this.doingTransferWhenAmountIsEnough(order.id);
      } else {
        const res = await this.createTransaction(
          user.id,
          +dto.amount,
          order.id,
        );
        if (res.status && res.result) {
          return {
            result: {
              RedirectURL: res.result.RedirectURL,
            },
            status: true,
            statusCode: 0,
          };
        }
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e.message || 'something wrong',
      };
    }
  }

  async doingTransferWhenAmountIsEnough(orderId) {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

      const dto = JSON.parse(order.payload) as UserTransferDto;
      const toWallet = await this.prisma.wallet.findFirst({
        where: {
          walletCode: dto.walletCode,
        },
        include: {
          User: true,
        },
      });
      if (!toWallet) {
        throw new ForbiddenException('Target User  wallet not founded');
      }

      const fromUser = await this.prisma.user.findUnique({
        where: {
          id: order.userId,
        },
        include: {
          Wallet: true,
        },
      });
      if (!fromUser || !fromUser.Wallet) {
        throw new ForbiddenException('From user wallet not founded');
      }
      if (fromUser.Wallet.amount < +dto.amount) {
        throw new ForbiddenException('Your amount is not enough');
      }
      const response = await this.transferMoneyWallet2Wallet(
        fromUser.Wallet.id,
        toWallet.id,
        dto.amount,
        'انتقال اعتبار ',
      );
      console.log(response)
      if (response.status) {
        await this.prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
            isPaid: true,
          },
        });
        const resnumTo = Date.now().toString();
        const toUserOrder = await this.prisma.order.create({
          data: {
            title: 'افزایش اعتبار',
            amount: +dto.amount,
            type: OrderType.creditToOtherWallet,
            userId: toWallet.User.id,
            isPaid: true,
            subTitle: toWallet.User.name ? `${toWallet.User.name}انتقال به ` : `${toWallet.User.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}انتقال به `,
            date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
            payload: JSON.stringify(dto),
            desc: {
              create: [
                // for update user push or update many  updateMany: [{where: { key: "key1" }, // update the record with key="key1" data: { value: "new_value1" } },
                {
                  key: 'کد رهگیری',
                  value: resnumTo,
                },
                {
                  key: 'تاریخ',
                  value: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
                },
              ],
            },
          },
        });
        await this.prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            isPaid: true,
          },
        });
        console.log({
          status: true,
          result :{
            RedirectURL :null
          },
        })
        return {
          status: true,
        };
      } else {
        throw new Error('response not true');
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
      };
    }
  }

  async createTransaction(
    customerId,
    amount,
    orderId,
    callback_url = null
  ): Promise<INewResponseAPI<any>> {
    const resnum = Date.now().toString();
    // const config = await this.prisma.config.findFirst({})
    const order = await this.prisma.order.findUnique({where:{id:orderId}})
    try {
      const wallet = await this.getWalletByUserId(customerId);
      let debt = 0 ; 
      if(+wallet.amount < 0 ){
        debt = Math.abs(+wallet.amount)
      }
      const data = JSON.stringify({
        merchant_id: this.config.get('MERCHANT_ID_ZARRINPAL'),
        amount: (+amount) + (+order.commission)  + debt,
        callback_url: callback_url ? callback_url : `${this.config.get('SERVER_ADDRESS')}/transactions/callback`,
        description: ` افزایش اعتبار برای کاربر ${wallet.User.mobile} `,
        metadata: { mobile: wallet.User.mobile },
        order_id: orderId,
      });

      const configuration = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.zarinpal.com/pg/v4/payment/request.json',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        data: data,
      };
      const response = await axios(configuration);
      console.log(response.data);
      console.log(wallet);
      console.log(orderId);
      if (response.data.data.code == 100) {
        const transaction = await this.prisma.transaction.create({
          data: {
            destWalletId: wallet.id,
            amount: +amount+1000,
            resnum: resnum,
            orderId:orderId,
            date: moment().format('jYYYY/jMM/jDD HH:mm:ss'),
            securePan: response.data.data.authority,
          },
        });
        console.log(transaction)
        console.log(666)
        return {
          result: {
            RedirectURL: `https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`,
            Transaction: transaction,
          },
          status: true,
          statusCode: 0,
        };
      } else {
        console.log(3)
        return {
          status: false,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        status: false,
      };
    }
  }

  async getMasterWallet() {
    const masterWallet = await this.prisma.wallet.findFirst({
      where: {
        walletType: 'MASTER',
      },
      select: {
        id: true,
        amount: true,
        User: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!masterWallet) {
      throw new ForbiddenException('Master wallet not founded');
    }
    return masterWallet;
  }

  async registerInLastPaidUsersDb(fromUserId, toUserId): Promise<void> {
    const isFirstTime = await this.prisma.lastPaidFriends.findMany({
      where: {
        AND: [{ fromUserId: fromUserId }, { destUserId: toUserId }],
      },
    });

    console.log(isFirstTime);
    if (isFirstTime?.length>0) {
      return;
    }
    if (isFirstTime?.length==0) {
      await this.prisma.lastPaidFriends.create({
        data: {
          fromUserId: fromUserId,
          destUserId: toUserId,
        },
      });
    }
  }
  
}
