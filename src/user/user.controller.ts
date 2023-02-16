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
import moment from 'moment-jalaali';

@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Controller('users')
@ApiTags("User Api's")
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  @Roles('ADMIN', 'MERCHANT', 'MARKETER', 'CUSTOMER')
  getMe(@User() user: any): Promise<INewResponseAPI<any>> {
    return this.userService.getMe(user);
  }

  @Post('upload')
  @Roles('ADMIN', 'MERCHANT')
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
  @Roles(
    'ADMIN',
    'USER',
    'MARKETER',
    'MERCHANT',
    Role.LEVEL1,
    Role.LEVEL2,
    Role.LEVEL3,
    Role.LEVEL4,
  )
  getUserInfo(@Param('id') id: string) {
    console.log(id);
    return this.userService.getUserInfo(id);
  }
}
