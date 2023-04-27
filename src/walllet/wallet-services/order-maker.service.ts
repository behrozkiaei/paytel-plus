import { OrderType } from 'src/utils/enums';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { chargeDto } from 'src/walllet/dto/internet.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment-jalaali');
@Injectable()
export class OrderMakerService {
  constructor(private prisma: PrismaService) {}
  async makeOrder(type: OrderType, user: any, dto: any) {
    const order_id =
      Math.floor(Math.random() * 1000000000).toString() ?? uuidv4();
    const date = moment().format('jYYYY/jMM/jDD HH:mm:ss');
    switch (type) {
      case OrderType.internetByCredit:
      case OrderType.internetByWallet:
        const order = await this.prisma.order.create({
          data: {
            title: 'خرید بسته اینترنت ',
            amount: +dto.amount ?? 0,
            type: dto.isWallet
              ? OrderType.internetByWallet
              : OrderType.internetByCredit,
            userId: user.id,
            isPaid: false,
            subTitle: dto.mobile,
            date: date,
            payload: JSON.stringify({ ...dto, order_id }),
          },
        });
        const updatedInternetOrder = await this.prisma.order.findUnique({
          where: { id: order.id },
          include: {
            desc: true,
          },
        });
        return updatedInternetOrder;

      case OrderType.chargeByCredit:
      case OrderType.chargeByWallet:
        const payload: chargeDto = dto;
        const chargeOrder = await this.prisma.order.create({
          data: {
            title: 'خرید شارژ',
            amount: +payload.amount ?? 0,
            type: payload.fromWallet
              ? OrderType.internetByWallet
              : OrderType.internetByCredit,
            userId: user.id,
            isPaid: false,
            subTitle: payload.mobile,
            date: date,
            payload: JSON.stringify({ ...payload, order_id: order_id }),
            desc: {
              create: [
                {
                  key: 'کد رهگیری',
                  value: order_id,
                },
              ],
            },
          },
        });
        const updatedChargeOrder = await this.prisma.order.findUnique({
          where: { id: chargeOrder.id },
          include: {
            desc: true,
          },
        });
        return updatedChargeOrder;
    }
  }
}
