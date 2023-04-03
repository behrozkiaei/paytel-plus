import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
require('dotenv').config()// remove this after you've confirmed it is working
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // console.log(process.env.DATABASE_URL)
    const  config = new ConfigService();
    super({
      datasources: {
        db: {
          url: config.get("DATABASE_URL"),
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      this.user.deleteMany(),
    ]);
  }
}
