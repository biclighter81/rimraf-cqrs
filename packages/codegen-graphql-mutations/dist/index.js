"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = void 0;
var plugin_helpers_1 = require("@graphql-codegen/plugin-helpers");
var graphql_1 = require("graphql");
var typeMap = {
    "ID": "string",
    "Boolean": "boolean",
    "String": "string",
    "Float": "number",
    "Int": "number"
};
var plugin = function (schema, documents, config, info) {
    if (!config.url) {
        throw new Error("You must specify \"url\" in my plugin configuration!");
    }
    var astNode = (0, plugin_helpers_1.getCachedDocumentNodeFromSchema)(schema);
    var nonUserTypes;
    var mutationFunc = function (node) {
        var _a;
        return (_a = node.fields) === null || _a === void 0 ? void 0 : _a.map(function (p) { return "export const " + p; }).join('\n');
    };
    var fieldFunc = function (node) {
        if ("nullabel" in node.type && "typeName" in node.type) {
            return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
        }
    };
    var getTyp = function (type) {
        if ("nullabel" in type && "typeName" in type) {
            return type.typeName;
        }
    };
    var result = (0, graphql_1.visit)(astNode, {
        "SchemaDefinition": function (node) {
            nonUserTypes = node.operationTypes;
            return null;
        },
        "ObjectTypeDefinition": {
            leave: function (node) {
                var _a;
                if (node.name.value == 'Mutation')
                    return mutationFunc(node);
                if (nonUserTypes.some(function (p) { return p.type.name.value == node.name.value; }))
                    return null;
                return "export interface ".concat(node.name.value, "{\n\t").concat((_a = node.fields) === null || _a === void 0 ? void 0 : _a.join(';\n\t'), "\n}");
            }
        },
        "NamedType": {
            leave: function (node) {
                var scalarType = typeMap[node.name.value];
                return { nullabel: false, typeName: scalarType !== null && scalarType !== void 0 ? scalarType : node.name.value };
            }
        },
        "NonNullType": {
            leave: function (node) {
                if ("nullabel" in node.type && "typeName" in node.type) {
                    return __assign(__assign({}, node.type), { nullabel: true });
                }
                return node.type;
            }
        },
        "FieldDefinition": {
            leave: function (node) {
                if (node.arguments !== undefined && node.arguments.length > 0) {
                    return "".concat(node.name.value, " = (").concat(node.arguments.map(fieldFunc), ") => {\n            const document = `\n        mutation (").concat(node.arguments.map(function (p) { return "$" + fieldFunc(p) + "!"; }).join(','), ") {\n          ").concat(node.name.value, "(").concat(node.arguments.map(function (p) { return p.name.value + ":$" + p.name.value; }).join(','), ") {\n              id\n              errorMessage\n            }\n          }          \n        `\n        return request<{ ").concat(node.name.value, ": ").concat(getTyp(node.type), " }>('").concat(config.url, "', document, { payload }).then(p => {\n            const response = p.").concat(node.name.value, ";\n            if (response.errorMessage)\n                throw response.errorMessage\n            return response.id\n        }).catch(err => {\n            if (err instanceof Error)\n                console.error(err);\n            else\n                throw err;\n            return \"\"\n        })\n          }");
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
            leave: function (node) {
                var _a, _b;
                return "interface ".concat(node.name.value, "{\n\t").concat((_b = (_a = node.fields) === null || _a === void 0 ? void 0 : _a.map(fieldFunc)) === null || _b === void 0 ? void 0 : _b.join(';\n\t'), "\n}");
            }
        }
    });
    return "\n/*\n * -------------------------------------------------------\n * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)\n * -------------------------------------------------------\n */\n\n/* tslint:disable */\n/* eslint-disable */\n  import { request } from 'graphql-request';\n\n  ".concat(result.definitions.filter(function (p) { return typeof p === "string"; }).join('\n'), "\n  ");
};
exports.plugin = plugin;
//# sourceMappingURL=index.js.map