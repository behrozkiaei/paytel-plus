/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class TransactionDto{
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    sourceWalletId : string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    destWalletId : string
}