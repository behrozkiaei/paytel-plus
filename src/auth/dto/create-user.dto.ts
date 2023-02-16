/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min,
    min,
  } from 'class-validator';
  
  export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email:string

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
    name  :string
    

    @IsString() 
    @IsOptional()
    @ApiProperty()
    address :string

    @IsString()
    @IsOptional()
    @ApiProperty()
    description :string

    @IsString()
    @IsOptional()
    @ApiProperty()
    lat :string

    @IsString()
    @IsOptional()
    @ApiProperty()
    lan :string

    @IsString()
    @IsOptional()
    @ApiProperty()
    status :string

    @IsString()
    @IsOptional()
    @ApiProperty()
    website :string

    @IsString()
    @IsOptional()
    @ApiProperty()
    contantPersonName:string

    @IsString()
    @IsOptional()
    @ApiProperty()
    contactPersonPhone:string

    @IsString()
    @IsOptional()
    @ApiProperty()
    icon :string

   
  @IsString()
  @IsOptional()
  @ApiProperty()
  nationalCode :string
  }
  