"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const conditionalEvent_1 = require("./conditionalEvent");
describe('ConditionalEvent', () => {
    let event;
    beforeEach(() => {
        event = new conditionalEvent_1.ConditionalEvent();
    });
    function createEventHandler() {
        const eventHandler = (() => {
            eventHandler.numberOfTimesCalled++;
        });
        eventHandler.numberOfTimesCalled = 0;
        return eventHandler;
    }
    function createThrowingEventHandler() {
        const eventHandler = (() => {
            eventHandler.numberOfTimesCalled++;
            throw 'some error';
        });
        eventHandler.numberOfTimesCalled = 0;
        return eventHandler;
    }
    function createConditionWithReturnValue(returnValue) {
        const condition = (() => {
            condition.numberOfTimesCalled++;
            return returnValue;
        });
        condition.numberOfTimesCalled = 0;
        return condition;
    }
    function createThrowintCondition() {
        const condition = (() => {
            condition.numberOfTimesCalled++;
            throw 'some error';
        });
        condition.numberOfTimesCalled = 0;
        return condition;
    }
    function verifyEventHandlerWasRaisedXTimes(times, eventHandler) {
        chai_1.expect(eventHandler.numberOfTimesCalled).to.be.equal(times);
    }
    function verifyEventHandlerWasRaisedOnce(eventHandler) {
        verifyEventHandlerWasRaisedXTimes(1, eventHandler);
    }
    function verifyEventHandlerWasNeverRaised(eventHandler) {
        verifyEventHandlerWasRaisedXTimes(0, eventHandler);
    }
    function verifyConditionWasCalledXTimes(times, condition) {
        chai_1.expect(condition.numberOfTimesCalled).to.be.equal(times);
    }
    function verifyConditionWasCalledOnce(condition) {
        verifyConditionWasCalledXTimes(1, condition);
    }
    function verifyConditionWasNeverCalled(condition) {
        verifyConditionWasCalledXTimes(0, condition);
    }
    describe('on', () => {
        it('registering same event twice should not throw error', () => {
            const handler = createEventHandler();
            const registeringAction = () => {
                event.on(handler);
                event.on(handler);
            };
            chai_1.expect(registeringAction).to.not.throw();
        });
        it('registering same event with same condition twice should not throw error', () => {
            const handler = createEventHandler();
            const condition = createConditionWithReturnValue(true);
            const registeringAction = () => {
                event.on(handler, condition);
                event.on(handler, condition);
            };
            chai_1.expect(registeringAction).to.not.throw();
        });
    });
    describe('off', () => {
        it('unregistering not registered event should not throw error', () => {
            const handler = createEventHandler();
            const unregisteringAction = () => {
                event.off(handler);
            };
            chai_1.expect(unregisteringAction).to.not.throw();
        });
    });
    describe('raise', () => {
        describe('no condition', () => {
            it('raising unregistered event should not throw errors', () => {
                event.raise();
            });
            it('raising on registered event should raise event on all registratios', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handler3 = createEventHandler();
                event.on(handler1);
                event.on(handler2);
                event.on(handler3);
                event.raise();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyEventHandlerWasRaisedOnce(handler2);
                verifyEventHandlerWasRaisedOnce(handler3);
            });
            it('registering twice with same event handler, raising, should raise once', () => {
                const handler = createEventHandler();
                event.on(handler);
                event.on(handler);
                event.raise();
                verifyEventHandlerWasRaisedOnce(handler);
            });
            it('registering event handler that throws an error should throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                event.on(throwingHandler);
                const raisingAction = () => event.raise();
                chai_1.expect(raisingAction).to.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler);
            });
            it('registering event handler that throws an error should not raise the next event handler', () => {
                const throwingHandler = createThrowingEventHandler();
                const handler = createEventHandler();
                event.on(throwingHandler);
                event.on(handler);
                const raisingAction = () => event.raise();
                chai_1.expect(raisingAction).to.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler);
                verifyEventHandlerWasNeverRaised(handler);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const handlerToUnregister = createEventHandler();
                event.on(handler);
                event.on(handlerToUnregister);
                event.off(handlerToUnregister);
                event.raise();
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('unregistering event handler should raise the not ramoved event handlers', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handlerToUnregister = createEventHandler();
                const handler3 = createEventHandler();
                const handler4 = createEventHandler();
                event.on(handler1);
                event.on(handler2);
                event.on(handlerToUnregister);
                event.on(handler3);
                event.on(handler4);
                event.off(handlerToUnregister);
                event.raise();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyEventHandlerWasRaisedOnce(handler2);
                verifyEventHandlerWasRaisedOnce(handler3);
                verifyEventHandlerWasRaisedOnce(handler4);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
        });
        describe('with condition', () => {
            it('raising should only call event handlers with truthy conditions', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handler3 = createEventHandler();
                const trueCondition = createConditionWithReturnValue(true);
                const falseCondition = createConditionWithReturnValue(false);
                event.on(handler1, trueCondition);
                event.on(handler2, falseCondition);
                event.on(handler3, trueCondition);
                event.raise();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyEventHandlerWasNeverRaised(handler2);
                verifyEventHandlerWasRaisedOnce(handler3);
                verifyConditionWasCalledXTimes(2, trueCondition);
                verifyConditionWasCalledOnce(falseCondition);
            });
            it('raising should call the condition once', () => {
                const handler = createEventHandler();
                const trueCondition = createConditionWithReturnValue(true);
                event.on(handler, trueCondition);
                event.raise();
                verifyConditionWasCalledOnce(trueCondition);
            });
            it('registering twice with same event handler and same condition, raising, should raise once', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                event.on(handler, condition);
                event.on(handler, condition);
                event.raise();
                verifyEventHandlerWasRaisedOnce(handler);
                verifyConditionWasCalledOnce(condition);
            });
            it('registering twice with same event handler and different condition, raising, should raise twice', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.raise();
                verifyConditionWasCalledOnce(condition1);
                verifyConditionWasCalledOnce(condition2);
                verifyEventHandlerWasRaisedXTimes(2, handler);
            });
            it('registering event handler that throws an error should throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition = createConditionWithReturnValue(true);
                event.on(throwingHandler, condition);
                const raisingAction = () => event.raise();
                chai_1.expect(raisingAction).to.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler);
                verifyConditionWasCalledOnce(condition);
            });
            it('registering event handler with condition that throws an error should throw error', () => {
                const eventHandler = createEventHandler();
                const throwingCondition = createThrowintCondition();
                event.on(eventHandler, throwingCondition);
                const raisingAction = () => event.raise();
                chai_1.expect(raisingAction).to.throw();
                verifyConditionWasCalledOnce(throwingCondition);
                verifyEventHandlerWasNeverRaised(eventHandler);
            });
            it('registering event handler that throws an error should not raise the next event handler or condition', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const handler = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                event.on(throwingHandler, condition1);
                event.on(handler, condition2);
                const raisingAction = () => event.raise();
                chai_1.expect(raisingAction).to.throw();
                verifyConditionWasCalledOnce(condition1);
                verifyEventHandlerWasRaisedOnce(throwingHandler);
                verifyConditionWasNeverCalled(condition2);
                verifyEventHandlerWasNeverRaised(handler);
            });
            it('registering event handler with condition that throws an error should not raise the next event handler or condition', () => {
                const handler1 = createThrowingEventHandler();
                const throwingCondition = createThrowintCondition();
                const handler2 = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                event.on(handler1, throwingCondition);
                event.on(handler2, condition2);
                const raisingAction = () => event.raise();
                chai_1.expect(raisingAction).to.throw();
                verifyConditionWasCalledOnce(throwingCondition);
                verifyEventHandlerWasNeverRaised(handler1);
                verifyConditionWasNeverCalled(condition2);
                verifyEventHandlerWasNeverRaised(handler2);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                const handlerToUnregister = createEventHandler();
                const conditionOfHandlerToUnregister = createConditionWithReturnValue(true);
                event.on(handler, condition);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.off(handlerToUnregister);
                event.raise();
                verifyConditionWasNeverCalled(conditionOfHandlerToUnregister);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('unregistering event handler should raise the not ramoved event handlers', () => {
                const handler1 = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const handler2 = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                const handlerToUnregister = createEventHandler();
                const conditionOfHandlerToUnregister = createConditionWithReturnValue(true);
                const handler3 = createEventHandler();
                const condition3 = createConditionWithReturnValue(true);
                const handler4 = createEventHandler();
                const condition4 = createConditionWithReturnValue(true);
                event.on(handler1, condition1);
                event.on(handler2, condition2);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.on(handler3, condition3);
                event.on(handler4, condition4);
                event.off(handlerToUnregister);
                event.raise();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyConditionWasCalledOnce(condition1);
                verifyEventHandlerWasRaisedOnce(handler2);
                verifyConditionWasCalledOnce(condition2);
                verifyEventHandlerWasRaisedOnce(handler3);
                verifyConditionWasCalledOnce(condition3);
                verifyEventHandlerWasRaisedOnce(handler4);
                verifyConditionWasCalledOnce(condition4);
                verifyConditionWasNeverCalled(conditionOfHandlerToUnregister);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('registering same handler with different conditions, unregister without condition, raise, should not raise', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const condition3 = createConditionWithReturnValue(true);
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler);
                event.raise();
                verifyConditionWasNeverCalled(condition1);
                verifyConditionWasNeverCalled(condition2);
                verifyConditionWasNeverCalled(condition3);
                verifyEventHandlerWasNeverRaised(handler);
            });
            it('registering same handler with different conditions, unregister with condition, raise, should raise correctly', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const condition3 = createConditionWithReturnValue(true);
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler, condition2);
                event.raise();
                verifyConditionWasCalledOnce(condition1);
                verifyConditionWasNeverCalled(condition2);
                verifyConditionWasCalledOnce(condition3);
                verifyEventHandlerWasRaisedXTimes(2, handler);
            });
        });
    });
    describe('raiseSafe', () => {
        describe('no condition', () => {
            it('raising unregistered event should not throw errors', () => {
                event.raiseSafe();
            });
            it('raising on registered event should raise event on all registratios', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handler3 = createEventHandler();
                event.on(handler1);
                event.on(handler2);
                event.on(handler3);
                event.raiseSafe();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyEventHandlerWasRaisedOnce(handler2);
                verifyEventHandlerWasRaisedOnce(handler3);
            });
            it('registering twice with same event handler, raising, should raise once', () => {
                const handler = createEventHandler();
                event.on(handler);
                event.on(handler);
                event.raiseSafe();
                verifyEventHandlerWasRaisedOnce(handler);
            });
            it('registering event handler that throws an error should not throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                event.on(throwingHandler);
                const raisingAction = () => event.raiseSafe();
                chai_1.expect(raisingAction).to.not.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler);
            });
            it('registering event handler that throws an error should raise the next event handler', () => {
                const throwingHandler = createThrowingEventHandler();
                const handler = createEventHandler();
                event.on(throwingHandler);
                event.on(handler);
                const raisingAction = () => event.raiseSafe();
                chai_1.expect(raisingAction).to.not.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler);
                verifyEventHandlerWasRaisedOnce(handler);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const handlerToUnregister = createEventHandler();
                event.on(handler);
                event.on(handlerToUnregister);
                event.off(handlerToUnregister);
                event.raiseSafe();
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('unregistering event handler should raise the not ramoved event handlers', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handlerToUnregister = createEventHandler();
                const handler3 = createEventHandler();
                const handler4 = createEventHandler();
                event.on(handler1);
                event.on(handler2);
                event.on(handlerToUnregister);
                event.on(handler3);
                event.on(handler4);
                event.off(handlerToUnregister);
                event.raiseSafe();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyEventHandlerWasRaisedOnce(handler2);
                verifyEventHandlerWasRaisedOnce(handler3);
                verifyEventHandlerWasRaisedOnce(handler4);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
        });
        describe('with condition', () => {
            it('raising should only call event handlers with truthy conditions', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handler3 = createEventHandler();
                const trueCondition = createConditionWithReturnValue(true);
                const falseCondition = createConditionWithReturnValue(false);
                event.on(handler1, trueCondition);
                event.on(handler2, falseCondition);
                event.on(handler3, trueCondition);
                event.raiseSafe();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyEventHandlerWasNeverRaised(handler2);
                verifyEventHandlerWasRaisedOnce(handler3);
                verifyConditionWasCalledXTimes(2, trueCondition);
                verifyConditionWasCalledOnce(falseCondition);
            });
            it('raising should call the condition once', () => {
                const handler = createEventHandler();
                const trueCondition = createConditionWithReturnValue(true);
                event.on(handler, trueCondition);
                event.raiseSafe();
                verifyConditionWasCalledOnce(trueCondition);
            });
            it('registering twice with same event handler and same condition, raising, should raise once', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                event.on(handler, condition);
                event.on(handler, condition);
                event.raiseSafe();
                verifyEventHandlerWasRaisedOnce(handler);
                verifyConditionWasCalledOnce(condition);
            });
            it('registering twice with same event handler and different condition, raising, should raise twice', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.raiseSafe();
                verifyEventHandlerWasRaisedXTimes(2, handler);
                verifyConditionWasCalledOnce(condition1);
                verifyConditionWasCalledOnce(condition2);
            });
            it('registering event handler that throws an error should not throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition = createConditionWithReturnValue(true);
                event.on(throwingHandler, condition);
                const raisingAction = () => event.raiseSafe();
                chai_1.expect(raisingAction).to.not.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler);
                verifyConditionWasCalledOnce(condition);
            });
            it('registering event handler with condition that throws an error should not throw error', () => {
                const eventHandler = createEventHandler();
                const throwingCondition = createThrowintCondition();
                event.on(eventHandler, throwingCondition);
                const raisingAction = () => event.raiseSafe();
                chai_1.expect(raisingAction).to.not.throw();
                verifyConditionWasCalledOnce(throwingCondition);
                verifyEventHandlerWasNeverRaised(eventHandler);
            });
            it('registering event handler that throws an error should raise the next event handler or condition', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const handler = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                event.on(throwingHandler, condition1);
                event.on(handler, condition2);
                const raisingAction = () => event.raiseSafe();
                chai_1.expect(raisingAction).to.not.throw();
                verifyConditionWasCalledOnce(condition1);
                verifyEventHandlerWasRaisedOnce(throwingHandler);
                verifyConditionWasCalledOnce(condition2);
                verifyEventHandlerWasRaisedOnce(handler);
            });
            it('registering event handler with condition that throws an error should raise the next event handler or condition', () => {
                const handler1 = createThrowingEventHandler();
                const throwingCondition = createThrowintCondition();
                const handler2 = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                event.on(handler1, throwingCondition);
                event.on(handler2, condition2);
                const raisingAction = () => event.raiseSafe();
                chai_1.expect(raisingAction).to.not.throw();
                verifyConditionWasCalledOnce(throwingCondition);
                verifyEventHandlerWasNeverRaised(handler1);
                verifyConditionWasCalledOnce(condition2);
                verifyEventHandlerWasRaisedOnce(handler2);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                const handlerToUnregister = createEventHandler();
                const conditionOfHandlerToUnregister = createConditionWithReturnValue(true);
                event.on(handler, condition);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.off(handlerToUnregister);
                event.raiseSafe();
                verifyConditionWasNeverCalled(conditionOfHandlerToUnregister);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('unregistering event handler should raise the not ramoved event handlers', () => {
                const handler1 = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const handler2 = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                const handlerToUnregister = createEventHandler();
                const conditionOfHandlerToUnregister = createConditionWithReturnValue(true);
                const handler3 = createEventHandler();
                const condition3 = createConditionWithReturnValue(true);
                const handler4 = createEventHandler();
                const condition4 = createConditionWithReturnValue(true);
                event.on(handler1, condition1);
                event.on(handler2, condition2);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.on(handler3, condition3);
                event.on(handler4, condition4);
                event.off(handlerToUnregister);
                event.raiseSafe();
                verifyEventHandlerWasRaisedOnce(handler1);
                verifyConditionWasCalledOnce(condition1);
                verifyEventHandlerWasRaisedOnce(handler2);
                verifyConditionWasCalledOnce(condition2);
                verifyEventHandlerWasRaisedOnce(handler3);
                verifyConditionWasCalledOnce(condition3);
                verifyEventHandlerWasRaisedOnce(handler4);
                verifyConditionWasCalledOnce(condition4);
                verifyConditionWasNeverCalled(conditionOfHandlerToUnregister);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('registering same handler with different conditions, unregister without condition, raise, should not raise', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const condition3 = createConditionWithReturnValue(true);
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler);
                event.raiseSafe();
                verifyConditionWasNeverCalled(condition1);
                verifyConditionWasNeverCalled(condition2);
                verifyConditionWasNeverCalled(condition3);
                verifyEventHandlerWasNeverRaised(handler);
            });
            it('registering same handler with different conditions, unregister with condition, raise, should raise correctly', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const condition3 = createConditionWithReturnValue(true);
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler, condition2);
                event.raiseSafe();
                verifyConditionWasCalledOnce(condition1);
                verifyConditionWasNeverCalled(condition2);
                verifyConditionWasCalledOnce(condition3);
                verifyEventHandlerWasRaisedXTimes(2, handler);
            });
        });
    });
});
//# sourceMappingURL=conditionalEvent.test.js.map