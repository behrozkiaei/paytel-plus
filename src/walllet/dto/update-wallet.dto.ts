import {
  IsNotEmpty,
  isNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { isFloat32Array, isFloat64Array } from 'util/types';

export class UpdateWalletDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  type: string;
}
