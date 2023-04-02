import { ServicesModule } from './services/services.module';
import { SmsService } from './utils/sms_handler';
import { WatchService } from './watch.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './midleware/logger.middleware';
import { WalletModule } from './walllet/wallet.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '@adminjs/nestjs'
import { MulterModule } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { SocketGateway } from './websocket';
import { CacheModule } from '@nestjs/common';
import { PaymentRequestModule } from './payment-request/payment-request.module';
import { PrismaClient } from '@prisma/client'
import { DMMFClass } from '@prisma/client/runtime'
import { PrismaService } from './prisma/prisma.service'
import AdminJS from 'adminjs'
import * as AdminJSPrisma from '@adminjs/prisma'


const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
}
AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
})


const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN)
  }
  return null
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    WalletModule,
    MulterModule.register({
      dest: '../public/upload',
    }),
    ServicesModule,
    PaymentRequestModule,
    AdminModule.createAdminAsync({
      useFactory: () => {
        // Note: Feel free to contribute to this documentation if you find a Nest-way of
        // injecting PrismaService into AdminJS module
        const prisma = new PrismaService()
        // `_baseDmmf` contains necessary Model metadata but it is a private method
        // so it isn't included in PrismaClient type
        const dmmf = ((prisma as any)._baseDmmf as DMMFClass)
        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [{
              resource: { model: dmmf.modelMap.User, client: prisma },
              options: {
                sort: {
                  sortBy: 'updatedAt',
                  direction: 'desc',
                },
              },
            },
            {
              resource: { model: dmmf.modelMap.Wallet, client: prisma },
              options: {
                sort: {
                  sortBy: 'updatedAt',
                  direction: 'desc',
                },
              },
            },
            {
              resource: { model: dmmf.modelMap.Transaction, client: prisma },
              options: {
                sort: {
                  sortBy: 'updatedAt',
                  direction: 'desc',
                },
              },
            },
            {
              resource: { model: dmmf.modelMap.Order, client: prisma },
              options: {
                sort: {
                  sortBy: 'updatedAt',
                  direction: 'desc',
                },
              },
            },
            {
              resource: { model: dmmf.modelMap.WalletTransfer, client: prisma },
              options: {},
            },
            {
              resource: { model: dmmf.modelMap.UserPaymentRequest, client: prisma },
              options: {},
            },
            {
              resource: { model: dmmf.modelMap.LastPaidFriends, client: prisma },
              options: {},
            },
            {
              resource: { model: dmmf.modelMap.keyValue, client: prisma },
              options: {},
            }
          ],
          },
          auth: {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'secret'
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret'
          },
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService, WatchService, SocketGateway, SmsService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/**');
  }
}
