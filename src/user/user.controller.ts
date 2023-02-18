import { BankAccount, UpdateAvatarDto, UpdateUser } from './dto/edit-user.dto';
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from './../utils/enums';
import { NantionalCardImage, UpdateShenasnameImage } from './dto/edit-user.dto';

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
const moment = require('moment-jalaali');

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
  getUserInfo(@Param('id') id: string): Promise<INewResponseAPI<any>> {
    return this.userService.getUserInfo(id);
  }

  @Get('user-by-wallet-code/:id')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getUserInfoByWalletCode(@Param('code') code: string) {
    return this.userService.getUserInfoByWalletCode(code);
  }

  @Patch('update-user')
  @Roles(Role.ADMIN, Role.LEVEL2, Role.LEVEL1)
  updateUsername(
    @User() user: any,
    @Body() dto: UpdateUser,
  ): Promise<INewResponseAPI<any>> {
    return this.userService.updateUser(user, dto);
  }

  @Patch('update-cartmaelli')
  @Roles(Role.ADMIN, Role.LEVEL1)
  async updateNationalCardImage(
    @User() user: string,
    @Body() dto: NantionalCardImage,
  ): Promise<INewResponseAPI<any>> {
    const url = await this.userService.convertBase64toImage(dto.cartMelli);
    return this.userService.updateNationalCardImage(user, url);
  }

  @Patch('update-shenasname')
  @Roles(Role.ADMIN, Role.LEVEL1)
  async updateIdentityImage(
    @User() user: string,
    @Body() dto: UpdateShenasnameImage,
  ): Promise<INewResponseAPI<any>> {
    const url = await this.userService.convertBase64toImage(dto.shenasname);
    return this.userService.updateIdentityImage(user, url);
  }
  @Patch('update-avatar')
  @Roles(Role.ADMIN, Role.LEVEL2, Role.LEVEL1)
  async updateAvatar(
    @User() user: string,
    @Body() dto: UpdateAvatarDto,
  ): Promise<INewResponseAPI<any>> {
    const url = await this.userService.convertBase64toImage(dto.avatar);
    return this.userService.updateAvatar(user, url);
  }
  @Patch('update-bank-account')
  @Roles(Role.ADMIN, Role.LEVEL1)
  updateBankAccount(
    @User() user: string,
    @Body() dto: BankAccount,
  ): Promise<INewResponseAPI<any>> {
    return this.userService.updateBankAccount(user, dto);
  }
}
