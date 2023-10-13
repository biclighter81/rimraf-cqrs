import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./node_modules/types/**/*.graphql",
  generates: {
    "./src/commands.ts": {
      plugins: ['codegen-graphql-mutations'],
      config: { url: "http://localhost:3002/graphql" }
    },
  },
  ignoreNoDocuments: true
};

export default config;