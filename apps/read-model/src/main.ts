import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from '@nestjs/common';
import { GraphQLError } from 'graphql';

export class GraphQLExceptionFilter implements ExceptionFilter {
  catch(error: any): any {
    if (error instanceof GraphQLError) {
      throw error;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GraphQLExceptionFilter());
  app.enableCors();
  await app.listen(4000);
}
bootstrap();
