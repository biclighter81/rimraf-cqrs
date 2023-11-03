"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
const plugin_helpers_1 = require("@graphql-codegen/plugin-helpers");
const graphql_1 = require("graphql");
const typeMap = {
    "ID": "string",
    "Boolean": "boolean",
    "String": "string",
    "Float": "number",
    "Int": "number"
};
const plugin = (schema, documents, config, info) => {
    var _a;
    if (!config.url) {
        throw new Error(`You must specify "url" in my plugin configuration!`);
    }
    const astNode = (0, plugin_helpers_1.getCachedDocumentNodeFromSchema)(schema);
    const fieldDefinitionNodeParentNodeForInput = {
        node: {
            kind: graphql_1.Kind.FIELD_DEFINITION,
            type: {
                kind: graphql_1.Kind.NAMED_TYPE,
                name: {
                    kind: graphql_1.Kind.NAME,
                    value: "__rootType"
                }
            },
            name: {
                kind: graphql_1.Kind.NAME,
                value: "__rootInputDef"
            }
        },
        type: "root"
    };
    const getFuncImplType = (node) => {
        if (node.kind == graphql_1.Kind.NAMED_TYPE)
            return node.name.value;
        if (node.kind == graphql_1.Kind.NON_NULL_TYPE)
            return getFuncImplType(node.type) + "!";
        return "";
    };
    const getFuncImplParameterDefinition = (node) => {
        return `${node.name.value}: ${getFuncImplType(node.type)}`;
    };
    const parentTemplateFunc = (templFunc) => (node) => (inner) => {
        const _fnc = (node, start) => (inner) => {
            const outerFunc = node.type == "child" ? _fnc(node.parent, node) : (p) => p;
            if (start === node) {
                return outerFunc(inner);
            }
            return outerFunc(templFunc(node, inner));
        };
        return _fnc(node, node)(inner);
    };
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
  }`;
    });
    const getFuncImplReturnTypeFromRequest = parentTemplateFunc((node, inner) => {
        return `${node.node.name.value}:{
    ${inner}
  }`;
    });
    const getFuncImplReturnPath = parentTemplateFunc((node, inner) => {
        return `${node.node.name.value}.${inner}`;
    });
    const getFuncImpl = (item) => {
        var _a, _b, _c;
        const node = item.node;
        return `
            const document = \`
        mutation (${(_a = node.arguments) === null || _a === void 0 ? void 0 : _a.map(p => "$" + getFuncImplParameterDefinition(p)).join(',')}) {
          ${getFuncImplMuationGrapghQlFromParent(item)(`${node.name.value}(${(_b = node.arguments) === null || _b === void 0 ? void 0 : _b.map(p => p.name.value + ":$" + p.name.value).join(',')}) {
            id
            errorMessage
          }`)}
          }          
        \`
        return request<{${getFuncImplReturnTypeFromRequest(item)(`${node.name.value}: ${getType(node.type, item)} `)}}>('${config.url}', document, { ${(_c = node.arguments) === null || _c === void 0 ? void 0 : _c.map(p => p.name.value).join(',')} }).then(p => {
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
    };
    const getFieldType = (item) => {
        if (item.node.arguments !== undefined && item.node.arguments.length > 0)
            return `(${[...item.node.arguments]
                .sort((a, b) => b.type.kind.localeCompare(a.type.kind))
                .map(getInputValueDefinitionNode(item))
                .join(",")})=>{${getFuncImpl(item)}}`;
        else
            return `${getType(item.node.type, item)}`;
    };
    const getObjectTypeDefinitionNode = (node, parent) => {
        var _a;
        return `{
      //${node.name.value}
      ${(_a = node.fields) === null || _a === void 0 ? void 0 : _a.map(node => `${node.name.value}:${getFieldType({ node, parent, type: "child" })}`).join(',\n\t\t\t')}
    }`;
    };
    const getNonNullTypeNode = (node, parent) => {
        return getType(node.type, parent);
    };
    const getNamedTypeNode = (node, parent) => {
        //kann ein ScalarType, inputtype oder objecttype sein
        //ScalarType mappen
        const typeName = node.name.value;
        if (typeName in typeMap && typeMap[typeName] !== undefined)
            return typeMap[typeName];
        //inputTypes werden als interface übersetzt, den namen einfach eintragen
        if (typeName in inputValueDefinitionNodes && inputValueDefinitionNodes[typeName] !== undefined)
            return node.name.value;
        //objectTypes werden inline übersetzt
        if (typeName in objectTypeDefinitionNodes && objectTypeDefinitionNodes[typeName] !== undefined) {
            return getObjectTypeDefinitionNode(objectTypeDefinitionNodes[typeName], parent);
        }
        return "//unknown ***" + node.name.value + "***";
    };
    const getType = (node, parent) => {
        if (node.kind == graphql_1.Kind.NAMED_TYPE)
            return getNamedTypeNode(node, parent);
        if (node.kind == graphql_1.Kind.NON_NULL_TYPE)
            return getNonNullTypeNode(node, parent);
        return "";
    };
    const getNameWithNullhandling = (node) => {
        return `${node.name.value}${node.type.kind == graphql_1.Kind.NAMED_TYPE ? "?" : ""}`;
    };
    const inputValueDefinitionNodesArr = astNode.definitions
        .filter((p) => p.kind == graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION);
    const inputValueDefinitionNodes = Object.fromEntries(inputValueDefinitionNodesArr
        .map(p => [p.name.value, p]));
    const objectTypeDefinitionNodes = Object.fromEntries(astNode.definitions
        .filter((p) => p.kind == graphql_1.Kind.OBJECT_TYPE_DEFINITION)
        .map(p => [p.name.value, p]));
    const getInputValueDefinitionNode = (parent) => (node) => {
        return `${getNameWithNullhandling(node)}:${getType(node.type, parent)}`;
    };
    const inputValueDefinitionTmpl = inputValueDefinitionNodesArr.map(node => {
        var _a, _b;
        return `interface ${node.name.value}{\n\t${(_b = (_a = node.fields) === null || _a === void 0 ? void 0 : _a.map(getInputValueDefinitionNode(fieldDefinitionNodeParentNodeForInput))) === null || _b === void 0 ? void 0 : _b.join(';\n\t')}\n}`;
    }).join('\n');
    let mutationTmpl = "";
    const mutation = astNode.definitions.find(node => { var _a; return "name" in node ? ((_a = node === null || node === void 0 ? void 0 : node.name) === null || _a === void 0 ? void 0 : _a.value) == "Mutation" : false; });
    if (mutation !== undefined) {
        mutationTmpl = ((_a = mutation.fields) === null || _a === void 0 ? void 0 : _a.map(node => {
            return `export const ${node.name.value}= ${getFieldType({ node, type: "root" })}`;
        }).join('\n')) || "";
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
  `;
};
exports.plugin = plugin;
//# sourceMappingURL=index.js.map