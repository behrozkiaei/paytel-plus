import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  amount: string;
}
