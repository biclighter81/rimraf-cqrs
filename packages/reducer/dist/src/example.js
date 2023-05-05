"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleReducer = exports.ExampleCreatedEvent = void 0;
var ExampleCreatedEvent = /** @class */ (function () {
    function ExampleCreatedEvent(id, uid) {
        this.name = 'ExampleCreatedEvent';
        this.id = id;
        this.uid = uid;
    }
    return ExampleCreatedEvent;
}());
exports.ExampleCreatedEvent = ExampleCreatedEvent;
var ExampleReducer = /** @class */ (function () {
    function ExampleReducer() {
        this.eventHandlers = new Map();
        this.eventHandlers.set('ExampleCreatedEvent', this.onExampleCreatedEvent);
    }
    ExampleReducer.prototype.onExampleCreatedEvent = function (event, state) {
        return {};
    };
    return ExampleReducer;
}());
exports.ExampleReducer = ExampleReducer;
