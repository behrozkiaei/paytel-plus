import { PaymentRequestDto } from './../dto/payment-request.dto';
import { JwtGuard } from './../../auth/guard/jwt.guard';
import { RolesGuard } from './../../auth/guard/role.guard';
import { PaymentRequestService } from './../services/payment-request.service';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorator/role.decorator';
import { User } from '../../auth/decorator/user.decorator';
import { Get } from '@nestjs/common/decorators';

@ApiTags('Payment Controller Request')
@Controller('payment-request')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PaymentRequestController {
  constructor(private walletService: PaymentRequestService) {}

  @Post('chashback')
  @Roles('MARKETER')
  @ApiOperation({ summary: 'Requesting chash back ' })
  chashback(@User() user: any, @Body() dto: PaymentRequestDto) {
    return this.walletService.chashback(user, dto);
  }

  @Get('getAll')
  @Roles('ADMIN')
  Allchashback(
    @User() user: any,
    @Query('index', new DefaultValuePipe(0)) index?: number,
    @Query('limit', new DefaultValuePipe(10)) limit?: number,
    @Query('from', new DefaultValuePipe('0')) from?: string,
    @Query('to', new DefaultValuePipe('999999999')) to?: string,
  ) {
    return this.walletService.Allchashback(user, index, limit, from, to);
  }
}
