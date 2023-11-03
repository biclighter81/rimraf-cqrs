import { getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers'

import { FieldDefinitionNode, GraphQLSchema, InputObjectTypeDefinitionNode, InputValueDefinitionNode, Kind, NameNode, NamedTypeNode, NonNullTypeNode, ObjectTypeDefinitionNode, TypeNode } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers'

const typeMap: { [key: string]: string } = {
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

  interface RootParent {
    type: "root",
    node: FieldDefinitionNode
  }
  interface _IFieldDefinitionNodeParentNode {
    type: "child"
    node: FieldDefinitionNode;//aktueller fielddef node
    parent: IFieldDefinitionNodeParentNode;//der letzte darüber
  }

  type IFieldDefinitionNodeParentNode = _IFieldDefinitionNodeParentNode | RootParent;

  const fieldDefinitionNodeParentNodeForInput: RootParent = {
    node: {
      kind: Kind.FIELD_DEFINITION,
      type: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: "__rootType"
        }
      },
      name: {
        kind: Kind.NAME,
        value: "__rootInputDef"
      }
    },
    type: "root"
  }

  const getFuncImplType = (node: TypeNode): string => {
    if (node.kind == Kind.NAMED_TYPE)
      return node.name.value;
    if (node.kind == Kind.NON_NULL_TYPE)
      return getFuncImplType(node.type) + "!";
    return ""
  }

  const getFuncImplParameterDefinition = (node: InputValueDefinitionNode) => {
    return `${node.name.value}: ${getFuncImplType(node.type)}`
  }

  const parentTemplateFunc = (templFunc: (node: IFieldDefinitionNodeParentNode, inner: string) => string) => (node: IFieldDefinitionNodeParentNode) => (inner: string): string => {
    const _fnc = (node: IFieldDefinitionNodeParentNode, start: IFieldDefinitionNodeParentNode) => (inner: string): string => {
      const outerFunc = node.type == "child" ? _fnc(node.parent, node) : (p: string) => p;
      if (start === node) {
        return outerFunc(inner);
      }
      return outerFunc(templFunc(node, inner));
    }
    return _fnc(node, node)(inner)
  }

  /*const getFuncImplMuationGrapghQlFromParent = (node: IFieldDefinitionNodeParentNode) => (inner: string): string => {
    const _fnc = (node: IFieldDefinitionNodeParentNode, start: IFieldDefinitionNodeParentNode) => (inner: string): string => {
      const outerFunc = node.type == "child" ? _fnc(node.parent, node) : (p: string) => p;
      if (start === node) {
        return outerFunc(inner);
      }
      return outerFunc(`${node.node.name.value}{
        ${inner}
      }`)
    }
    return _fnc(node, node)(inner)
  }*/

  const getFuncImplMuationGrapghQlFromParent = parentTemplateFunc((node, inner) => {
    return `${node.node.name.value}{
    ${inner}
  }`});


  const getFuncImplReturnTypeFromRequest = parentTemplateFunc((node, inner) => {
    return `${node.node.name.value}:{
    ${inner}
  }`})

  const getFuncImplReturnPath = parentTemplateFunc((node, inner) => {
    return `${node.node.name.value}.${inner}`})

  const getFuncImpl = (item: IFieldDefinitionNodeParentNode) => {
    const node = item.node;
    return `
            const document = \`
        mutation (${node.arguments?.map(p => "$" + getFuncImplParameterDefinition(p)).join(',')}) {
          ${getFuncImplMuationGrapghQlFromParent(item)(`${node.name.value}(${node.arguments?.map(p => p.name.value + ":$" + p.name.value).join(',')}) {
            id
            errorMessage
          }`)}
          }          
        \`
        return request<{${getFuncImplReturnTypeFromRequest(item)(`${node.name.value}: ${getType(node.type, item)} `)}}>('${config.url}', document, { ${node.arguments?.map(p => p.name.value).join(',')} }).then(p => {
            const response = p.${getFuncImplReturnPath(item)(node.name.value)};
            if (response.errorMessage)
                throw response.errorMessage
            return response.id
        }).catch(err => {
            if (err instanceof Error)
                console.error(err);
            else
                throw err;
            return ""
        })`;
  }

  const getFieldType = (item: IFieldDefinitionNodeParentNode) => {
    if (item.node.arguments !== undefined && item.node.arguments.length > 0)
      return `(${[...item.node.arguments]
        .sort((a, b) => b.type.kind.localeCompare(a.type.kind))
        .map(getInputValueDefinitionNode(item))
        .join(",")})=>{${getFuncImpl(item)}}`
    else
      return `${getType(item.node.type, item)}`
  }
  const getObjectTypeDefinitionNode = (node: ObjectTypeDefinitionNode, parent: IFieldDefinitionNodeParentNode) => {
    return `{
      //${node.name.value}
      ${node.fields?.map(node => `${node.name.value}:${getFieldType({ node, parent, type: "child" })}`).join(',\n\t\t\t')}
    }`
  }
  const getNonNullTypeNode = (node: NonNullTypeNode, parent: IFieldDefinitionNodeParentNode) => {
    return getType(node.type, parent);
  }
  const getNamedTypeNode = (node: NamedTypeNode, parent: IFieldDefinitionNodeParentNode) => {
    //kann ein ScalarType, inputtype oder objecttype sein

    //ScalarType mappen
    const typeName = node.name.value;
    if (typeName in typeMap && typeMap[typeName] !== undefined)
      return typeMap[typeName];

    //inputTypes werden als interface übersetzt, den namen einfach eintragen
    if (typeName in inputValueDefinitionNodes && inputValueDefinitionNodes[typeName] !== undefined)
      return node.name.value

    //objectTypes werden inline übersetzt
    if (typeName in objectTypeDefinitionNodes && objectTypeDefinitionNodes[typeName] !== undefined) {
      return getObjectTypeDefinitionNode(objectTypeDefinitionNodes[typeName], parent)
    }

    return "//unknown ***" + node.name.value + "***";
  }
  const getType = (node: TypeNode, parent: IFieldDefinitionNodeParentNode): string => {
    if (node.kind == Kind.NAMED_TYPE)
      return getNamedTypeNode(node, parent);
    if (node.kind == Kind.NON_NULL_TYPE)
      return getNonNullTypeNode(node, parent);
    return ""
  }

  const getNameWithNullhandling = (node: { name: NameNode } & { type: TypeNode }) => {
    return `${node.name.value}${node.type.kind == Kind.NAMED_TYPE ? "?" : ""}`
  }

  const inputValueDefinitionNodesArr = astNode.definitions
    .filter((p): p is InputObjectTypeDefinitionNode => p.kind == Kind.INPUT_OBJECT_TYPE_DEFINITION);

  const inputValueDefinitionNodes = Object.fromEntries<InputObjectTypeDefinitionNode>(
    inputValueDefinitionNodesArr
      .map(p => ([p.name.value, p] as const))
  );

  const objectTypeDefinitionNodes = Object.fromEntries<ObjectTypeDefinitionNode>(
    astNode.definitions
      .filter((p): p is ObjectTypeDefinitionNode => p.kind == Kind.OBJECT_TYPE_DEFINITION)
      .map(p => ([p.name.value, p] as const))
  );

  const getInputValueDefinitionNode = (parent: IFieldDefinitionNodeParentNode) => (node: InputValueDefinitionNode) => {
    return `${getNameWithNullhandling(node)}:${getType(node.type, parent)}`;
  }

  const inputValueDefinitionTmpl = inputValueDefinitionNodesArr.map(node => {
    return `interface ${node.name.value}{\n\t${node.fields?.map(getInputValueDefinitionNode(fieldDefinitionNodeParentNodeForInput))?.join(';\n\t')}\n}`
  }).join('\n')

  let mutationTmpl = ""
  const mutation = astNode.definitions.find(node => "name" in node ? node?.name?.value == "Mutation" : false) as ObjectTypeDefinitionNode
  if (mutation !== undefined) {
    mutationTmpl = mutation.fields?.map(node => {
      return `export const ${node.name.value}= ${getFieldType({ node, type: "root" })}`;
    }).join('\n') || "";
  }

  return `
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
  import { request } from 'graphql-request';
${inputValueDefinitionTmpl}
  ${mutationTmpl}
  `
}