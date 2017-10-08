"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConditionalEventT {
    constructor() {
        this._conditionalEventHandlers = [];
        this._defaultTruthyCondition = () => true;
    }
    on(eventHandler, condition) {
        if (!condition) {
            condition = this._defaultTruthyCondition;
        }
        const conditionalEventHandler = {
            eventHandler: eventHandler,
            condition: condition
        };
        this._registerIfNotRegisteredYet(conditionalEventHandler);
    }
    off(eventHandler, condition) {
        if (!condition) {
            this._conditionalEventHandlers =
                this._filterConditionalEventHandlersThatContainEventHandler(eventHandler);
        }
        else {
            this._conditionalEventHandlers =
                this._filterConditionalEventHandlersByEventHandlerAndCondition(eventHandler, condition);
        }
    }
    raise(data) {
        this._conditionalEventHandlers.forEach((_conditionalEventHandler) => {
            this._callEventHandlerIfConditionIsSatisfied(_conditionalEventHandler, data);
        });
    }
    raiseSafe(data) {
        this._conditionalEventHandlers.forEach((_conditionalEventHandler) => {
            this._callEventHandlerIfConditionIsSatisfiedSafe(_conditionalEventHandler, data);
        });
    }
    _registerIfNotRegisteredYet(conditionalEventHandler) {
        if (this._isAlreadyRegistered(conditionalEventHandler)) {
            return;
        }
        this._conditionalEventHandlers.push(conditionalEventHandler);
    }
    _isAlreadyRegistered(conditionalEventHandlerToCheck) {
        for (let i = 0; i < this._conditionalEventHandlers.length; i++) {
            const conditionalEventHandler = this._conditionalEventHandlers[i];
            if (this._areSameConditionalEventHandlers(conditionalEventHandler, conditionalEventHandlerToCheck)) {
                return true;
            }
        }
        return false;
    }
    _areSameConditionalEventHandlers(first, second) {
        return first.eventHandler === second.eventHandler &&
            first.condition === second.condition;
    }
    _callEventHandlerIfConditionIsSatisfiedSafe(conditionalEventHandler, data) {
        try {
            this._callEventHandlerIfConditionIsSatisfied(conditionalEventHandler, data);
        }
        catch (e) {
        }
    }
    _callEventHandlerIfConditionIsSatisfied(conditionalEventHandler, data) {
        if (conditionalEventHandler.condition(data)) {
            conditionalEventHandler.eventHandler(data);
        }
    }
    _filterConditionalEventHandlersThatContainEventHandler(eventHandler) {
        const result = [];
        for (let i = 0; i < this._conditionalEventHandlers.length; i++) {
            const conditionalEventHandler = this._conditionalEventHandlers[i];
            if (conditionalEventHandler.eventHandler !== eventHandler) {
                result.push(conditionalEventHandler);
            }
        }
        return result;
    }
    _filterConditionalEventHandlersByEventHandlerAndCondition(eventHandler, condition) {
        const conditionalEventHandlerToFilter = {
            eventHandler: eventHandler,
            condition: condition
        };
        const result = [];
        for (let i = 0; i < this._conditionalEventHandlers.length; i++) {
            const conditionalEventHandler = this._conditionalEventHandlers[i];
            if (!this._areSameConditionalEventHandlers(conditionalEventHandler, conditionalEventHandlerToFilter)) {
                result.push(conditionalEventHandler);
            }
        }
        return result;
    }
}
exports.ConditionalEventT = ConditionalEventT;
//# sourceMappingURL=conditionalEventT.js.map