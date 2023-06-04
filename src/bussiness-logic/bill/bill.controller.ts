import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import { BillService } from './bill.service';
import { Roles } from 'src/auth/decorator/role.decorator';
import { Role } from 'src/utils/enums';
import { User } from 'src/auth/decorator/user.decorator';
import { BillAmountInquiryDto, PayBillAuthed } from './dto/bill.dto';
import { BillInquiryResponseRepoInterface } from 'src/utils/interfaces/bill.interfaces';

@ApiTags("Bill auth services Api's")
@Controller('bill')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags("Naji services Api's")
export class BillAuthController {
  constructor(
    private billService: BillService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
  ) {}

  @Post('inquiry-bill-amount')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getUserId(
    @User() user: any,
    @Body() dto: BillAmountInquiryDto,
  ): Promise<INewResponseAPI<BillInquiryResponseRepoInterface>> {
    return this.billService.inquiryBillAmount(user, dto);
  }

  @Post('pay-bill-authed')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  payBillWhenAuthedByPayIdAndBillId(
    @User() user: any,
    @Body() dto: PayBillAuthed,
  ): Promise<INewResponseAPI<any>> {
    return this.billService.payBillWhenAuthedByPayIdAndBillId(user, dto);
  }


}
