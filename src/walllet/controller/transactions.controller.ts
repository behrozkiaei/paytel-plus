import { chargeDto } from './../dto/internet.dto';
import { ChargePayload } from './../../utils/interfaces/charge-payload.interface';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { InternetDto } from '../dto/internet.dto';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorator/role.decorator';
import { User } from '../../auth/decorator/user.decorator';
import { JwtGuard } from '../../auth/guard';
import { RolesGuard } from '../../auth/guard/role.guard';
import { TransactionDto } from '../dto/transaction.dto';
import { Role } from 'src/utils/enums';
import { CanTransaction } from 'src/auth/decorator/canTransaction';
import { TransactionsService } from 'src/walllet/wallet-services/transactions.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

@ApiTags("Transactions  Api's")
@Controller('transaction')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Post('create')
  @Roles('ADMIN')
  @CanTransaction()
  @ApiOperation({ summary: 'Create transaction method' })
  createTransaction(@Body() dto: TransactionDto) {
    return this.transactionService.createTransaction(dto);
  }

  @Patch('update')
  @Roles('ADMIN')
  updateTransaction(@Param('id') id: string, @Body() dto: TransactionDto) {
    return this.transactionService.updateTransaction(id, dto);
  }

  @Delete('/:id')
  @Roles('ADMIN', 'MERCHANT')
  deleteById(@Param('id') id: string) {
    return this.transactionService.deleteTransaction(id);
  }

  @Get('/get-all-orders')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getAllOrders(
    @User() user: any,
    @Query('from', new DefaultValuePipe(0)) from?: number,
    @Query('take', new DefaultValuePipe(10)) take?: number,
  ): any {
    return this.transactionService.getAllOrders(user, from, take);
  }

  
  @Get('/order-by-id')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getOrderById(
    @User() user: any,
    @Param('id') id: string
  ): any {
    return this.transactionService.getOrderById(user, id);
  }
  @Post('buyInternet')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  @CanTransaction()
  buyInternet(
    @User() user: any,
    @Body() dto: InternetDto,
  ): Promise<INewResponseAPI<any>> {
    return this.transactionService.buyInternet(user, dto);
  }

  @Post('buyCharge')
  @CanTransaction()
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  buyCharge(
    @User() user: any,
    @Body() dto: chargeDto,
  ): Promise<INewResponseAPI<any>> {
    console.log(dto);
    return this.transactionService.buyCharge(user, dto);
  }
}
