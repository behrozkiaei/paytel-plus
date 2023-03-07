import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { OtpType } from 'src/utils/enums';

export class SetPassDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches('/^09[0|1|2|3|9][0-9]{8}$/')
    @Min(11)
    @Max(11)
    userId: string;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    uid: string;
  }