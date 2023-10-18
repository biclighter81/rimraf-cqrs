
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "./node_modules/types/commands.graphql",
  generates: {
    "src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        avoidOptionals: false,
        contextType: "../Graphql.context#GraphQlContext"
      }
    }
  }
};

export default config;
