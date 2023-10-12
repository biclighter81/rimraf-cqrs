import { getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers'

import { GraphQLSchema, InputValueDefinitionNode, ObjectTypeDefinitionNode, OperationTypeDefinitionNode, TypeNode, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers'

const typeMap = {
  "ID": "string",
  "Boolean": "boolean",
  "String": "string",
  "Float": "number",
  "Int": "number"
}
export const plugin: PluginFunction = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
  info
) => {

  if (!config.url) {
    throw new Error(`You must specify "url" in my plugin configuration!`)
  }

  const astNode = getCachedDocumentNodeFromSchema(schema);
  let nonUserTypes: ReadonlyArray<OperationTypeDefinitionNode>;

  const mutationFunc = (node: ObjectTypeDefinitionNode) => {
    return node.fields?.map(p => "export const " + p).join('\n');
  }

  const fieldFunc = (node: InputValueDefinitionNode) => {
    if ("nullabel" in node.type && "typeName" in node.type) {
      return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
    }
  }

  const getTyp = (type: TypeNode) => {
    if ("nullabel" in type && "typeName" in type) {
      return type.typeName as string;
    }
  }


  const result = visit(astNode, {
    "SchemaDefinition": (node) => {
      nonUserTypes = node.operationTypes;
      return null;
    },
    "ObjectTypeDefinition": {
      leave: (node) => {
        if (node.name.value == 'Mutation')
          return mutationFunc(node);

        if (nonUserTypes.some(p => p.type.name.value == node.name.value))
          return null;

        return `export interface ${node.name.value}{\n\t${node.fields?.join(';\n\t')}\n}`

      }
    },
    "NamedType": {
      leave: (node) => {
        const scalarType = typeMap[node.name.value as keyof typeof typeMap];

        return { nullabel: false, typeName: scalarType ?? node.name.value };
      }
    },
    "NonNullType": {
      leave: (node) => {
        if ("nullabel" in node.type && "typeName" in node.type) {
          return { ...node.type, nullabel: true }
        }
        return node.type;
      }
    },
    "FieldDefinition": {
      leave: (node) => {
        if (node.arguments !== undefined && node.arguments.length > 0) {

          return `${node.name.value} = (${node.arguments.map(fieldFunc)}) => {
            const document = \`
        mutation (${node.arguments.map(p => "$" + fieldFunc(p) + "!").join(',')}) {
          ${node.name.value}(${node.arguments.map(p => "$" + p.name.value).join(',')}) {
              id
              errorMessage
            }
          }          
        \`
        return request<{ ${node.name.value}: ${getTyp(node.type)} }>('${config.url}', document, { payload }).then(p => {
            const response = p.${node.name.value};
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })
          }`;
        }
        if ("nullabel" in node.type && "typeName" in node.type) {
          return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
        }
      }
    },
    // "InputValueDefinition": {
    //   leave: (node) => {
    //     if ("nullabel" in node.type && "typeName" in node.type) {
    //       return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
    //     }
    //   }
    // },
    "InputObjectTypeDefinition": {
      leave: (node) => {
        return `interface ${node.name.value}{\n\t${node.fields?.map(fieldFunc)?.join(';\n\t')}\n}`
      }
    }
  })


  return `
  import { request } from 'graphql-request';

  ${result.definitions.filter(p => typeof p === "string").join('\n')}
  `
}