/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min
} from 'class-validator';
import { OtpType } from 'src/utils/enums';
  
  export class LoginUserDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches("/^09[0|1|2|3|9][0-9]{8}$/")
    @Min(11)
    @Max(11)
    mobile :string


    @IsString()
    @IsOptional()
    @ApiProperty()
    otpType :OtpType
  }
  

  
  


  export class sendOtpDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches("/^09[0|1|2|3|9][0-9]{8}$/")
    @Min(11)
    @Max(11)
    mobile :string


    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    otpType :OtpType
  }
  
  export class verifyOtpDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @Matches("/^09[0|1|2|3|9][0-9]{8}$/")
    @Min(11)
    @Max(11)
    mobile :string


    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password :string

    @IsString()
    @IsOptional()
    @ApiProperty()
    fcmToken? :string

    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    fromWeb? :boolean

  }