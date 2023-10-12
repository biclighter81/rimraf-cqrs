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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.exampleReducer = void 0;
exports.exampleReducer = {
    ExampleCreated: function (payload, state) {
        return __spreadArrays(state, [{ ExampleId: payload.id, name: payload.name }]);
    },
    ExampleDeleted: function (payload, state) {
        return state.filter(function (s) { return s.ExampleId != payload.id; });
    },
    ExampleTextChanged: function (payload, state) {
        return state.map(function (p) { return (p.ExampleId == payload.id ? __assign(__assign({}, p), { name: payload.text }) : p); });
    }
};
