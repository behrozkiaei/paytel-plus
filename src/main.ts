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

import session = require('express-session');
// somewhere in your initialization file
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{cors:true});
  const config = new DocumentBuilder()
  .setTitle('Paytel server example')
  .setDescription('Paytel server API s prepared for simplifying development')
  .setVersion('1.0')
  .addTag('PaytelServer')
  .addServer('http://localhost:3000')

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
  
    app.use(helmet());
    app.use(cookieParser());
    app.use(
      session({
        secret: 'your-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    // Increase maximum request payload size to 10mb
    app.use(bodyParser.json({ limit: '4mb' }));
    app.use(bodyParser.urlencoded({ limit: '4mb', extended: true }));

    // app.use(csurf());
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    await app.listen(3000);
  }
bootstrap();
