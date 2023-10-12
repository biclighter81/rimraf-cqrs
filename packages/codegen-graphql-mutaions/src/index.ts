import { getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers'

import { GraphQLSchema, ObjectTypeDefinitionNode, OperationTypeDefinitionNode, visit } from 'graphql';
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
  config: any
) => {
  const astNode = getCachedDocumentNodeFromSchema(schema);
  //const n = { ...astNode, definitions: [astNode.definitions[1]] };
  let nonUserTypes: ReadonlyArray<OperationTypeDefinitionNode>;

  const mutationFunc = (node: ObjectTypeDefinitionNode) => {
    return node;
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

        return `interface ${node.name.value}{\n\t${node.fields?.join(';\n\t')}\n}`

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
        if ("nullabel" in node.type && "typeName" in node.type) {
          return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
        }
      }
    },
    "InputValueDefinition": {
      leave: (node) => {
        if ("nullabel" in node.type && "typeName" in node.type) {
          return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
        }
      }
    },
    "InputObjectTypeDefinition": {
      leave: (node) => {
        return `interface ${node.name.value}{\n\t${node.fields?.join(';\n\t')}\n}`
      }
    }
  })


  return result.definitions.filter(p => typeof p === "string").join('\n')
}