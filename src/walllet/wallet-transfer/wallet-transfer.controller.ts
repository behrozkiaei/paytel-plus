import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorator/role.decorator';
import { User } from '../../auth/decorator/user.decorator';
import { JwtGuard } from './../../auth/guard/jwt.guard';
import { RolesGuard } from './../../auth/guard/role.guard';
import { TransferDto } from './dto/create-wallet-transfer.dto';
import { WalletTransferService } from './wallet-transfer.service';

@ApiTags("Wallet transfer  Api's")
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Controller('wallet-transfer')
export class WalletTransferController {
  constructor(private readonly walletTransferService: WalletTransferService) {}

  // @Post()
  // create(@Body() createWalletTransferDto: CreateWalletTransferDto) {
  //   return this.walletTransferService.create(createWalletTransferDto);
  // }
  @Get('/')
  @Roles('ADMIN', 'MERCHANT')
  getServices(
    @User() user,
    @Query('index', new DefaultValuePipe(0)) index?: number,
    @Query('limit', new DefaultValuePipe(10)) limit?: number,
    @Query('from', new DefaultValuePipe('0')) from?: string,
    @Query('to', new DefaultValuePipe('999999999')) to?: string,
    @Query('isExcel', new DefaultValuePipe(false)) isExcel?: boolean,
  ) {
    return this.walletTransferService.findAll(
      user,
      index,
      limit,
      from,
      to,
      isExcel,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.walletTransferService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateWalletTransferDto: UpdateWalletTransferDto) {
  //   return this.walletTransferService.update(+id, updateWalletTransferDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.walletTransferService.remove(+id);
  // }
}
