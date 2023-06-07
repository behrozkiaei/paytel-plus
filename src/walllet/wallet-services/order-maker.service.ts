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
            commission : 1000,
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
            commission : 1000,
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

      case OrderType.DRIVING_LICENSE_BY_WALLET:
      case OrderType.DRIVING_LICENSE_BY_CREDIT:
      case OrderType.NEGETIVE_POINT_BY_WALLET:
      case OrderType.NEGETIVE_POINT_BY_CREDIT:
      case OrderType.ACTIVE_PLATES_BY_WALLET:
      case OrderType.ACTIVE_PLATES_BY_CREDIT:
      case OrderType.PASSPORT_STATUS_BY_WALLET:
      case OrderType.PASSPORT_STATUS_BY_CREDIT:
      case OrderType.COUNTRY_LEAVING_BY_WALLET:
      case OrderType.COUNTRY_LEAVING_BY_CREDIT:
      case OrderType.VIOLATION_REPORT_BY_WALLET:
      case OrderType.VIOLATION_REPORT_BY_CREDIT:
      case OrderType.VIOLATION_IMAGE_BY_WALLET:
      case OrderType.VIOLATION_IMAGE_BY_CREDIT:
      case OrderType.VIOLATION_AGGREGATE_BY_WALLET:
      case OrderType.VIOLATION_AGGREGATE_BY_CREDIT:
      case OrderType.VIOLATION_AGGREGATE_NO_AUTH_BY_CREDIT:
      case OrderType.DOCUMENT_STATUS_BY_WALLET:
      case OrderType.DOCUMENT_STATUS_BY_CREDIT:
        const najiPayload: any = dto;
        const najiOrder = await this.prisma.order.create({
          data: {
            title: 'استعلام راهور',
            amount: +najiPayload.price ?? 52000,
            type: dto.type,
            userId: user.id,
            commission : 0,
            isPaid: false,
            subTitle: 'استعلام',
            date: date,
            payload: JSON.stringify({ ...najiPayload }),
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

        return najiOrder;
      case OrderType.BILL_AMOUNT_INQUIRY_BY_CREDIT:
        const billAmountInquiryPayload: any = dto;
        const billOrder = await this.prisma.order.create({
          data: {
            title: 'استعلام قبض',
            amount: 500,
            type: OrderType.BILL_AMOUNT_INQUIRY_BY_CREDIT,
            userId: user.id,
            commission : 0,
            isPaid: false,
            subTitle: 'استعلام قبض'  ,
            date: date,
            payload: JSON.stringify({ ...billAmountInquiryPayload }),
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
        const billOrderDesc = await this.prisma.order.findUnique({
          where: { id: billOrder.id },
          include: {
            desc: true,
          },
        });
        return billOrderDesc;
        case OrderType.BILL_PAYMENT_BY_CREDIT:
        case OrderType.BILL_PAYMENT_BY_WALLET:
          const billPay = await this.prisma.order.create({
            data: {
              title: 'استعلام قبض',
              amount: dto.amount,
              type: dto.type,
              userId: user.id,
              commission : type == OrderType.BILL_PAYMENT_BY_CREDIT ? 1000 : 0,
              isPaid: false,
              subTitle: ' استعلام قبض'  ,
              date: date,
              payload: JSON.stringify({ ...dto }),
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

          return billPay;
    }
  }
}
