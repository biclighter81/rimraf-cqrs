
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./node_modules/types/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
});
