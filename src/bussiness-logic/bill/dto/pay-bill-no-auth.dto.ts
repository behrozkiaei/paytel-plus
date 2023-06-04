import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty,  IsString } from 'class-validator';

export class PayBill {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  payId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  billId: string;
}

