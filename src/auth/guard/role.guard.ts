import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const isPublic = this.reflector.get<boolean>( "isPublic", context.getHandler() );

		
    if (!roles) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user  // THIS is what is missing

    return roles.some((role) => {
      return role === user.role;
    });
  }
}