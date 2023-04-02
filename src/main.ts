/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import hbs = require('hbs')
import * as bodyParser from 'body-parser';
import * as admin from 'firebase-admin';
require('dotenv').config();
const serviceAccount = require('../google-services.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
import session = require('express-session');
// somewhere in your initialization file
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{cors:true});
  const config = new DocumentBuilder()
  .setTitle('Paytel server example')
  .setDescription('Paytel server API s prepared for simplifying development')
  .setVersion('1.0')
  .addTag('PaytelServer')
  .addServer(process.env.SERVER_ADDRESS)

  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
    'access-token',
    )
    .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    
    app.useStaticAssets(join(__dirname, '..', 'public'), {
      index: false,
      prefix: '/public',
    });
  
    // app.use(helmet());
    // app.use(helmet());
    app.use(  
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy:true,
        dnsPrefetchControl:true,
        frameguard:true,
        hsts:true,
        ieNoOpen:true,
        noSniff:true,
        referrerPolicy:true,
        xssFilter:true,
      })
    );
    console.log("start server")
    // app.use(helmet.contentSecurityPolicy());
    // app.use(helmet.crossOriginEmbedderPolicy());
    // app.use(helmet.crossOriginOpenerPolicy());
    // app.use(helmet.crossOriginResourcePolicy());
    // app.use(helmet.dnsPrefetchControl());
    // app.use(helmet.frameguard());
    // app.use(helmet.hidePoweredBy());
    // app.use(helmet.hsts());
    // app.use(helmet.ieNoOpen());
    // app.use(helmet.noSniff());
    // app.use(helmet.originAgentCluster());
    // app.use(helmet.permittedCrossDomainPolicies());
    // app.use(helmet.referrerPolicy());
    // app.use(helmet.xssFilter());


    app.use(cookieParser());
    app.use(
      session({
        secret: 'your-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    // Increase maximum request payload size to 10mb
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    // // app.use(csurf());
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    await app.listen(3000);
  }
bootstrap();
