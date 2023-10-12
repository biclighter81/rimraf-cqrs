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
var plugin = function (schema, documents, config) {
    var astNode = (0, plugin_helpers_1.getCachedDocumentNodeFromSchema)(schema);
    //const n = { ...astNode, definitions: [astNode.definitions[1]] };
    var nonUserTypes;
    var mutationFunc = function (node) {
        return node;
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
                return "interface ".concat(node.name.value, "{\n\t").concat((_a = node.fields) === null || _a === void 0 ? void 0 : _a.join(';\n\t'), "\n}");
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
                if ("nullabel" in node.type && "typeName" in node.type) {
                    return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
                }
            }
        },
        "InputValueDefinition": {
            leave: function (node) {
                if ("nullabel" in node.type && "typeName" in node.type) {
                    return node.name.value + (node.type.nullabel ? "" : "?") + ": " + node.type.typeName;
                }
            }
        },
        "InputObjectTypeDefinition": {
            leave: function (node) {
                var _a;
                return "interface ".concat(node.name.value, "{\n\t").concat((_a = node.fields) === null || _a === void 0 ? void 0 : _a.join(';\n\t'), "\n}");
            }
        }
    });
    return result.definitions.filter(function (p) { return typeof p === "string"; }).join('\n');
};
exports.plugin = plugin;
//# sourceMappingURL=index.js.map