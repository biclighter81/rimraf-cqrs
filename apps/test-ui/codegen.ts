import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3002/graphql",
  generates: {
    "./src/__generated__.ts": {
      plugins: ['codegen-graphql-mutations'],
    },
  },
  ignoreNoDocuments:true
};

export default config;