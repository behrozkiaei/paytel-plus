import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import moment from 'moment-jalaali';
import { PaymentRequestDto } from '../dto/payment-request.dto';

@Injectable()
export class PaymentRequestService {
  constructor(private prisma: PrismaService) {}

  async chashback(user, dto: PaymentRequestDto) {
    try {
      await this.prisma.paymentRequest.create({
        data: {
          userId: user.id,
          amount: +dto.amount,
          state: 'Pending',
          date: moment().format('jYYYY/jMM/jDD'),
        },
      });

      return {
        status: true,
        result: null,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
        result: null,
      };
    }
  }

  async Allchashback(
    user,
    index = 1,
    limit = 10,
    from = '0',
    to = '99999999999999',
  ) {
    let query;
    let where;
    //order
    const order = {
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
    };
    const timeFilter = {
      AND: [{ date: { gt: from } }, { date: { lt: to } }],
    };

    const select = {
      skip: index * limit,
      take: (index + 1) * limit,
      select: {
        id: true,
        state: true,
        date: true,
        user: true,
        createdAt: true,
        updatedAt: true,
        amount: true,
        desc1: true,
        desc3: true,
        desc2: true,
        bankResponse: true,
        dateResponse: true,
      },
    };

    // eslint-disable-next-line prefer-const
    where = {
      ...timeFilter,
    };
    // eslint-disable-next-line prefer-const
    query = {
      where: {
        ...where,
      },
      ...order,
      ...select,
    };

    try {
      // const count =  await this.prisma.paymentRequest.aggregate({
      //   where :{
      //     ...where
      //   },
      //   _count: {
      //     id: true,
      //   },
      // })
      const requests = await this.prisma.paymentRequest.findMany(query);
      return {
        result: {
          data: requests,
          length: requests.length,
          pageIndex: index,
          pageSize: limit,
        },
        status: true,
        statusCode: 0,
      };
    } catch (e) {
      console.log(e);
      return {
        result: null,
        status: false,
        statusCode: 0,
      };
    }
  }
}
