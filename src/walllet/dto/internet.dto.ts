/* eslint-disable @typescript-eslint/no-var-requires */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
const moment = require('moment-jalaali');

export class InternetDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  product_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  operator: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  sim_type: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  fromWallet: boolean;
}

export class chargeDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  fromWallet: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  operator: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  charge_type: string;
}
