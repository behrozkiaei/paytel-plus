import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PaymentRequestService } from './payment-request.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UpdatePaymentRequestDto } from './dto/update-payment-request.dto';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/utils/enums';
import { Roles } from 'src/auth/decorator/role.decorator';
import { User } from 'src/auth/decorator/user.decorator';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';

@Controller('payment-request')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags("Payment request Api's")
export class PaymentRequestController {
  constructor(private readonly paymentRequestService: PaymentRequestService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  create(
    @User() user,
    @Body() createPaymentRequestDto: CreatePaymentRequestDto,
  ) {
    return this.paymentRequestService.create(user, createPaymentRequestDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  findAll(@User() user): Promise<INewResponseAPI<any>> {
    return this.paymentRequestService.findAll(user.id);
  }
  @Delete(':id')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  remove(@User() user, @Param('id') id: string): Promise<INewResponseAPI<any>> {
    return this.paymentRequestService.remove(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentRequestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentRequestDto: UpdatePaymentRequestDto,
  ) {
    return this.paymentRequestService.update(+id, updatePaymentRequestDto);
  }
}
