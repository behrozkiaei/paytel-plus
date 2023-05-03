import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletTransferDto {}

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
