import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

const  moment = require('moment-jalaali')
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector ,private config : ConfigService) {
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const CheckCanTransaction = this.reflector.get<string[]>('checkCanTransaction', context.getHandler());
    const isPublic = this.reflector.get<boolean>( "isPublic", context.getHandler() );

    const request = context.switchToHttp().getRequest();
    const user = request.user  // THIS is what is missing
		if(CheckCanTransaction){
      const end = moment().format('jYYYY/jMM/jDD HH:mm:ss');
      const duration = moment(end, 'jYYYY/jMM/jDD HH:mm:ss').diff(
        moment(user.loginTime, 'jYYYY/jMM/jDD HH:mm:ss'),
        'minutes',
      );
      const dif = moment.duration(duration, 'minutes').asMinutes();
      console.log(dif)
      if (dif > +this.config.get("USER_LOGIN_TIME_FOR_TRANSACTION")) {
        return false;
      }
    }
    if (!roles) {
      return false;
    }
    
    return roles.some((role) => {
      return role === user.role;
    });
  }
}