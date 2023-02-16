import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateWalletTransferDto } from './create-wallet-transfer.dto';

export class UpdateWalletTransferDto extends PartialType(CreateWalletTransferDto) {}

