import { Role } from './../utils/enums';
import {
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { Roles } from '../auth/decorator/role.decorator';
import { User } from '../auth/decorator/user.decorator';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { UserService } from './user.service';
const  moment = require('moment-jalaali')

@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Controller('users')
@ApiTags("User Api's")
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getMe(@User() user: any): Promise<INewResponseAPI<any>> {
    return this.userService.getMe(user);
  }

  @Post('upload')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/upload',
        filename: (req, file, callback) => {
          const ext = extname(file.originalname);
          const newFileName = moment().format('jYYYY-jMM-jDD-HH-mm-ss') + ext;
          callback(null, newFileName);
        },
      }),
    }),
  )
  uploadFile(
    @User() user: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1000000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file);
    return this.userService.uploadAvatar(user, file);
  }

  @Get('user-info/:id')
  @Roles(Role.ADMIN)
  getUserInfo(@Param('id') id: string) {
    return this.userService.getUserInfo(id);
  }

  @Get('user-by-wallet-code/:id')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getUserInfoByWalletCode(@Param('code') code: string) {
    return this.userService.getUserInfoByWalletCode(code);
  }
}
