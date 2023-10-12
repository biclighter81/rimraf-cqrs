import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3002/graphql",
  generates: {
    "./src/commands.ts": {
      plugins: ['codegen-graphql-mutations'],
      config: { url: "http://localhost:3002/graphql" }
    },
  },
  ignoreNoDocuments: true
};

export default config;