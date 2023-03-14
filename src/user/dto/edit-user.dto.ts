import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
export class UpdateUser {
  @IsString()
  @IsOptional()
  @ApiProperty()
  username?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  lat?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  lan?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nationalCode?: string;
}

export class UpdateShenasnameImage {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  shenasname: string;
}
export class NantionalCardImage {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cartMelli: string;
}
export class UpdateAvatarDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  avatar: string;
}
export class BankAccount {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  card: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  sheba: string;
}
export class CheckPassDto{
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class ListOfNumbers {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  listOfNumbers :string;
}

export class contacts {

  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  phone: string;
}