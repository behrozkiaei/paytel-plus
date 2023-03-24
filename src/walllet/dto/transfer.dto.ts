import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransferDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  mode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  amount: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  userId: string;
}

export class UserTransferDto {

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  amount: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  walletCode: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  fromWallet : boolean

}
