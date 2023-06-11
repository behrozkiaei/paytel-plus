import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserNajiDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nationalCode: string;
}

export class palteIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  plateId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fromWallet: boolean;


  
}

export class palteIdAndViolationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  plateId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  violationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fromWallet: boolean;
}
export class VerifyUserNajiDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nationalCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  otp: string;
}

export class plateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstPart: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  secondPart: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  countryPart: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  charPart: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  najiId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: 'CAR' | 'MOTOR';
}

export class AggregateViolationReportWhitoutRegisterationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nationalCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstPart: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  secondPart: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  countryPart: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  charPart: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: 'CAR' | 'MOTOR';
}

export class NegeticvePoint {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  driverLicenseNumber: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  fromWallet: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  najiId: string;
}
export class WalletOCredit {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  fromWallet: boolean;
}

export class DriverNajiDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  fromWallet: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  najiId: string;
}


export class NationalCodeDto{
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nationalCode: string;
}

export class MobileDto{
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobile: string;
}


export class MobileAndNationalDto{
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  mobile: string;


  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nationalCode: string;
}