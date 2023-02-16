import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateWalletTransferDto,
  TransferDto,
} from './dto/create-wallet-transfer.dto';
import { UpdateWalletTransferDto } from './dto/update-wallet-transfer.dto';
@Injectable()
export class WalletTransferService {
  constructor(private prisma: PrismaService) {}
  create(createWalletTransferDto: CreateWalletTransferDto) {
    return 'This action adds a new walletTransfer';
  }

  async findAll(
    user,
    index = 1,
    limit = 10,
    from = '0',
    to = '99999999999999',
    isExcel = false,
  ) {
    let query;
    let where;
    //order
    const userWallet = await this.prisma.wallet.findUnique({
      where: {
        userId: user.id,
      },
    });
    if (!userWallet) {
      return {
        status: false,
        message: 'user wallet not founded',
      };
    }
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

    if (user.Role == 'MERCHANT') {
      where = {
        OR: [{ walletDest: userWallet.id }, { sourceWalletId: userWallet.id }],
        ...timeFilter,
      };
      query = {
        where: {
          OR: [
            { walletDest: userWallet.id },
            { sourceWalletId: userWallet.id },
          ],
          ...timeFilter,
        },
      };
    } else {
      where = {
        ...timeFilter,
      };
      query = {
        where: {
          ...timeFilter,
        },
      };
    }
    query = {
      where: {
        ...timeFilter,
        ...where,
      },
      ...order,
      select: {
        walletSource: {
          select: {
            amount: true,
            merchant: {
              select: {
                name: true,
                mobile: true,
              },
            },
          },
        },
        walletDest: {
          select: {
            amount: true,
            merchant: {
              select: {
                name: true,
                mobile: true,
              },
            },
          },
        },
        id: true,
        sourceWalletId: true,
        destWalletId: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        date: true,
      },
    };

    // query ={}

    try {
      const count = await this.prisma.walletTransfer.aggregate({
        where: {
          ...timeFilter,
        },
        _count: {
          id: true,
        },
      });
      const transfers = await this.prisma.walletTransfer.findMany(query);

      return {
        result: {
          data: transfers,
          length: count._count.id,
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

  findOne(id: number) {
    return `This action returns a #${id} walletTransfer`;
  }

  update(id: number, _updateWalletTransferDto: UpdateWalletTransferDto) {
    return `This action updates a #${id} walletTransfer`;
  }

  remove(id: number) {
    return `This action removes a #${id} walletTransfer`;
  }
}
