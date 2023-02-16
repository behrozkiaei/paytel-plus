import { DefaultValuePipe, Query } from '@nestjs/common';
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post,UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorator/role.decorator';
import { RolesGuard } from '../../auth/guard/role.guard';
import { JwtGuard } from '../../auth/guard';
import { TransactionDto } from '../dto/transaction.dto';
import { TransactionsService } from '../services/transactions.service';
import { User } from '../../auth/decorator/user.decorator';

@ApiTags("Transactions  Api's")
@Controller("transaction")
@UseGuards(JwtGuard,RolesGuard)
@ApiBearerAuth('access-token')
export class TransactionsController { 

        constructor(private transactionService : TransactionsService){}
    
        
        @Post("create")
        @Roles("ADMIN")
        @ApiOperation({ summary: 'Create transaction method' })
        createTransaction(@Body() dto : TransactionDto){
            return this.transactionService.createTransaction(dto);
        }
    
    
        @Patch("update")
        @Roles("ADMIN")
        updateTransaction(@Param("id") id :string , @Body() dto :TransactionDto){
            return this.transactionService.updateTransaction(id ,dto);
        }
    
        @Get("/")
        @Roles("ADMIN","MERCHANT")
        getAll(@User() user :any ,
            @Query("index",new DefaultValuePipe(0)) index? :number  ,
            @Query("limit",new DefaultValuePipe(10)) limit?:number ,
            @Query("from",new DefaultValuePipe("0")) from?:string ,
            @Query("to",new DefaultValuePipe("999999999")) to? :string ,
            @Query("isExcel",new DefaultValuePipe(false)) isExcel? :boolean 
            ){
            return this.transactionService.getAllTransaction(user ,index, limit ,from,to,isExcel);
        }
        @Get("/:id")
        @Roles("ADMIN","MERCHANT")
        getWalletById(@Param("id") id : string){
            return this.transactionService.getTRansactionById(id);
        }
    
        @Delete("/:id")
        @Roles("ADMIN","MERCHANT")
        deleteById(@Param("id") id :string ){
            return this.transactionService.deleteTransaction(id);
        }
}
