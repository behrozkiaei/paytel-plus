import { AdminModule } from '@adminjs/nestjs';
import * as AdminJSPrisma from '@adminjs/prisma';
import { CacheModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { DMMFClass } from '@prisma/client/runtime';
import AdminJS from 'adminjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './bussiness-logic/charge-internet/services.module';
import { LoggerMiddleware } from './midleware/logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { SmsService } from './utils/sms_handler';
import { WalletModule } from './walllet/wallet.module';
import { WatchService } from './watch.service';
import { SocketGateway } from './websocket';
import { PaymentRequestModule } from './bussiness-logic/payment-request/payment-request.module';

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
};
AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
});

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};
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
        const prisma = new PrismaService();
        // `_baseDmmf` contains necessary Model metadata but it is a private method
        // so it isn't included in PrismaClient type
        const dmmf = (prisma as any)._baseDmmf as DMMFClass;
        return {
          adminJsOptions: {
            rootPath: '/admin',

            resources: [
              {
                resource: { model: dmmf.modelMap.User, client: prisma },
                options: {
                  sort: {
                    sortBy: 'updatedAt',
                    direction: 'desc',
                  },
                  actions: {
                    edit: {
                      before: async (request) => {
                        // console.log(request.method);
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          // console.log(payload);
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
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
                  actions: {
                    edit: {
                      before: async (request) => {
                        console.log(request);
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          console.log(payload);
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
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
                  actions: {
                    edit: {
                      before: async (request) => {
                        console.log(request);
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          console.log(payload);
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
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
                  actions: {
                    edit: {
                      before: async (request) => {
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
                  },
                },
              },
              {
                resource: {
                  model: dmmf.modelMap.WalletTransfer,
                  client: prisma,
                },
                options: {
                  sort: {
                    sortBy: 'updatedAt',
                    direction: 'desc',
                  },
                  actions: {
                    edit: {
                      before: async (request) => {
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          console.log(payload);
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
                  },
                },
              },
              {
                resource: {
                  model: dmmf.modelMap.UserPaymentRequest,
                  client: prisma,
                },
                options: {
                  sort: {
                    sortBy: 'updatedAt',
                    direction: 'desc',
                  },
                  actions: {
                    edit: {
                      before: async (request) => {
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
                  },
                },
              },
              {
                resource: {
                  model: dmmf.modelMap.LastPaidFriends,
                  client: prisma,
                },
                options: {
                  sort: {
                    sortBy: 'updatedAt',
                    direction: 'desc',
                  },
                  actions: {
                    edit: {
                      before: async (request) => {
                        // console.log(request);
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          // console.log(payload);
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
                  },
                },
              },
              {
                resource: { model: dmmf.modelMap.keyValue, client: prisma },
                options: {
                  sort: {
                    sortBy: 'updatedAt',
                    direction: 'desc',
                  },
                  actions: {
                    edit: {
                      before: async (request) => {
                        // console.log(request);
                        if (request.method === 'post') {
                          const { id, ...payload } = request.payload;
                          // console.log(payload);
                          request.payload = payload;
                        }
                        return request;
                      },
                    },
                  },
                },
              },
            ],
          },
          auth: {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'secret',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
          locale: {
            language: 'fa',
            translations: {
              labels: {
                User: 'کاربران',
              },
            },
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, WatchService, SocketGateway, SmsService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/**');
  }
}
