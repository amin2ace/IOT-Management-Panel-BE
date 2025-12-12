import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filter/global-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw on unknown properties
      // transform: true, // transform payloads to DTO instances
    }),
  );

  // Use global filters to avoid app crash
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Security middleware
  app.use(helmet());

  const cookieParser = require('cookie-parser');
  // Pass cookie secret if available (for signed cookies)
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // CORS setup
  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_URL') || 'http://localhost:30001',
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Global prefix
  const apiPrefix = configService.getOrThrow<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Swagger docs
  initSwagger(app, apiPrefix);

  // Start server
  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
  // console.log(
  //   `Application is running on: http://localhost:${port}/${apiPrefix}`,
  // );
}

function initSwagger(app: INestApplication, apiPrefix = 'api') {
  const config = new DocumentBuilder()
    .setTitle('IoT-Management')
    .setDescription('Management panel for IoT sensors')
    .setVersion('1.0')
    .addCookieAuth('session-id', {
      type: 'apiKey',
      in: 'cookie',
      name: 'session-id',
    })
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     name: 'access-token',
    //     description: 'Enter your access token',
    //     in: 'header',
    //   },
    //   'access-token', // Reference name for @ApiBearerAuth()
    // )
    .addCookieAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Mount docs under the API prefix to match global prefix
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
}

bootstrap();
