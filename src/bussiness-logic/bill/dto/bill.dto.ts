import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BillType, Period } from "src/utils/interfaces/bill.interfaces";
import { Operator } from "src/utils/interfaces/charge-payload.interface";

export class BillAmountInquiryDto{
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    bill_type: BillType;

    @IsString()
    @IsOptional()
    @ApiProperty()
    mobile?: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    operator?: Operator;

    @IsString()
    @IsOptional()
    @ApiProperty()
    period?: Period;

    @IsString()
    @IsOptional()
    @ApiProperty()
    phone?: string; //  فقط برای استعلام قبض تلفن اجباری
   
    @IsString()
    @IsOptional()
    @ApiProperty()
    bill_id?: string; //فقط برای استعلام قبض آب و برق اجباری  - شناسه قبض (موجود بر روی قبض)
   
    @IsString()
    @IsOptional()
    @ApiProperty()
    participate_code?: string; //کد اشتراک کنتور گاز (موجود بر روی قبض)



}

export class PayBillAuthed {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    payId: string;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    billId: string;

    
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty()
    frmoWallet: boolean;
  }
  
  