import { ServicesService } from './services.service';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { Roles } from '../../auth/decorator/role.decorator';
import { UseGuards, Get } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from '../../auth/guard/role.guard';
import { Controller, Post } from '@nestjs/common';
import { Role } from 'src/utils/enums';
import { User } from 'src/auth/decorator/user.decorator';

@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Controller('Services')
@ApiTags("Services Api's")
@Controller('Services')
export class ServicesController {
  constructor(private services: ServicesService) {}
  @Get('getInternetPackages')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getInternetPackages(@User() user: any): Promise<INewResponseAPI<any>> {
    return this.services.getInternetPackages();
  }
}
