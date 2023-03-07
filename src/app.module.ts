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
import { MulterModule } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { SocketGateway } from './websocket';
import { CacheModule } from '@nestjs/common';
import { PaymentRequestModule } from './payment-request/payment-request.module';

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
  ],
  controllers: [AppController],
  providers: [AppService, WatchService, SocketGateway, SmsService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/**');
  }
}
