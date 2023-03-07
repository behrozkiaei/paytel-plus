
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionGuard implements CanActivate {
    constructor (  private prisma : PrismaService ){}
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request = context.switchToHttp().getRequest();
    const user =  request.user;
    console.log("transaction" , user)
    return true;
  }
}