import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class AuthDto {
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
  password: string;

  
}


export class SendOtp {

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Matches("/^09[0|1|2|3|9][0-9]{8}$/")
  @Min(11)
  @Max(11)
  mobile :string

}
export class MarketerLoginDto{
 
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Matches("/^09[0|1|2|3|9][0-9]{8}$/")
  @Min(11)
  @Max(11)
  mobile : string
}