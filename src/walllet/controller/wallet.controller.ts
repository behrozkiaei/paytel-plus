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
import { TransferDto, UserTransferDto } from '../dto/transfer.dto';
import { Role } from 'src/utils/enums';
@ApiTags("Wallet  Api's")
@Controller("wallet")
@UseGuards(JwtGuard,RolesGuard)
@ApiBearerAuth('access-token')
export class WalletController {

    constructor(private walletService : WalletService){}

    

    @Patch("update")
    @Roles(Role.ADMIN)
    updateWallet(@Param("id") id :string ,dto :UpdateWalletDto){
        this.walletService.updateWallet(id, dto)
    }


    @Get("/")
    @Roles(Role.ADMIN)
    getAll(){
        return this.walletService.getAllWallet()
    }


    @Get("/:id")
    @Roles(Role.ADMIN)
    getWalletById(@Param("id") id : string){
        return this.walletService.getWalletById(id);
    }

    @Delete("/:id")
    @Roles(Role.ADMIN)
    deleteById(@Param("id") id :string ){
        return this.walletService.deleteWallet(id);
    } 

    @Post("/my-wallet")
    @Roles(Role.ADMIN)
    getWalletByUserId(@User() user :any){
       return  this.walletService.getWalletByUserId(user.id)
    }
    
    @Post('user-transfer')
    @Roles(Role.LEVEL1,Role.LEVEL2) 
    transferMoneyByUser(@User() user: any , @Body() dto : UserTransferDto){
      return this.walletService.transferByUser(user,dto)
    }
}
