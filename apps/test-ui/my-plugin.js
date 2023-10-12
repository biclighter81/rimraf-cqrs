const { getCachedDocumentNodeFromSchema } = require('@graphql-codegen/plugin-helpers')

const { visit } = require('graphql')

module.exports = {
  plugin(schema) {
    const astNode = getCachedDocumentNodeFromSchema(schema) // Transforms the GraphQLSchema into ASTNode
    const visitor = {
      FieldDefinition: {
        leave: (node) => {
          return node.name.value
        }
      },
      ObjectTypeDefinition: {
        enter: (node, key, parent) => {
          if (node.name.value === "Mutation") {
            const realNode = parent[key];
            return node.fields.join("\n")
          }
          return null;
        },
        leave: (node, key, parent) => {
          if (node.name.value === "Mutation") {
            const realNode = parent[key];
            return node.fields.join("\n")
          }
        }
      },
      InputObjectTypeDefinition: {
        leave: (node) => {
          return node.name.value
        }
      }
    }
    debugger;
    const result = visit(astNode, visitor)

    return result.definitions.filter(p => typeof p === "string").join('\n')
  }
}

/*
//const astNode = getCachedDocumentNodeFromSchema(schema);

  // const result = visit(astNode,{
  //   "ObjectTypeDefinition":(node)=>{
  //     return node;
  //   }
  // })

  return"";// result.definitions.filter(p => typeof p === "string").join('\n')
  */