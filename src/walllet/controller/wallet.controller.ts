/* eslint-disable @typescript-eslint/no-unused-vars */
import { UpdateWalletDto } from './../dto/update-wallet.dto';
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { Body, Delete, Get, Param, Patch, Post, Render, Res, UseGuards } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorator/role.decorator';
import { User } from '../../auth/decorator/user.decorator';
import { JwtGuard } from '../../auth/guard';
import { RolesGuard } from '../../auth/guard/role.guard';
import { PaymentRequestDto } from '../dto/payment-request.dto';
import { WalletService } from '../services/wallet.service';
import { Response } from 'express';
import { TransferDto } from '../dto/transfer.dto';
@ApiTags("Wallet  Api's")
@Controller("wallet")
@UseGuards(JwtGuard,RolesGuard)
@ApiBearerAuth('access-token')
export class WalletController {

    constructor(private walletService : WalletService){}

    @Post("create")
    @Roles("ADMIN","MERCHANT")
    @ApiOperation({ summary: 'Create Wallet' })
    createWallet( @User() user  :any){
        return this.walletService.createWallet(user);
    }

    @Patch("update")
    @Roles("ADMIN","MERCHANT")
    updateWsllet(@Param("id") id :string ,dto :UpdateWalletDto){
        this.walletService.updateWallet(id, dto)
    }


    @Get("/")
    @Roles("ADMIN")
    getAll(){
        return this.walletService.getAllWallet()
    }


    @Get("/:id")
    @Roles("ADMIN","MERCHANT")
    getWalletById(@Param("id") id : string){
        return this.walletService.getWalletById(id);
    }

    @Delete("/:id")
    @Roles("ADMIN","MERCHANT")
    deleteById(@Param("id") id :string ){
        return this.walletService.deleteWallet(id);
    } 

    @Post("/my-wallet")
    @Roles("ADMIN","MERCHANT")
    getWalletByUserId(@User() user :any){
       return  this.walletService.getWalletByUserId(user.id)
    }

    @Post("payment-request")
    @Roles("ADMIN","MERCHANT")
    customerPaymentRequest(@Body() dto :PaymentRequestDto ,@User() user){
        return  this.walletService.customerPaymentRequest(dto.amount ,user.id)
    }


    @Post('transfer')
    @Roles("ADMIN") 
    transferMonet(@Body() dto : TransferDto){
      return this.walletService.transfer(dto)
    }
}
