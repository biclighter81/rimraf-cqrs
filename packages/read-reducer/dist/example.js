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
exports.exampleReducer = void 0;
exports.exampleReducer = {
    ExampleCreated: function (payload, state) {
        return __assign(__assign({}, state), { name: payload.name });
    },
    ExampleTextChanged: function (payload, state) {
        return __assign(__assign({}, state), { text: payload.text });
    },
};
