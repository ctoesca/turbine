"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const conditionalEventT_1 = require("./conditionalEventT");
describe('ConditionalEventT', () => {
    let event;
    beforeEach(() => {
        event = new conditionalEventT_1.ConditionalEventT();
    });
    function createEventHandler() {
        const eventHandler = ((_data) => {
            eventHandler.actualDataThatWasCalledWith.push(_data);
        });
        eventHandler.actualDataThatWasCalledWith = [];
        return eventHandler;
    }
    function createThrowingEventHandler() {
        const eventHandler = ((_data) => {
            eventHandler.actualDataThatWasCalledWith.push(_data);
            throw 'some error';
        });
        eventHandler.actualDataThatWasCalledWith = [];
        return eventHandler;
    }
    function createConditionWithReturnValue(returnValue) {
        const condition = ((_data) => {
            condition.actualDataThatWasCalledWith.push(_data);
            return returnValue;
        });
        condition.actualDataThatWasCalledWith = [];
        return condition;
    }
    function createThrowintCondition() {
        const condition = ((_data) => {
            condition.actualDataThatWasCalledWith.push(_data);
            throw 'some error';
        });
        condition.actualDataThatWasCalledWith = [];
        return condition;
    }
    function createData() {
        return {
            1: 'some data1',
            2: 'some data2'
        };
    }
    function verifyEventHandlerWasRaisedXTimes(times, eventHandler, data) {
        chai_1.expect(eventHandler.actualDataThatWasCalledWith.length).to.be.equal(times);
        for (let i = 0; i < times; i++) {
            chai_1.expect(eventHandler.actualDataThatWasCalledWith[i]).to.be.equal(data[i]);
        }
    }
    function verifyEventHandlerWasRaisedOnce(eventHandler, data) {
        verifyEventHandlerWasRaisedXTimes(1, eventHandler, [data]);
    }
    function verifyEventHandlerWasNeverRaised(eventHandler) {
        verifyEventHandlerWasRaisedXTimes(0, eventHandler, []);
    }
    function verifyConditionWasCalledXTimes(times, condition, data) {
        chai_1.expect(condition.actualDataThatWasCalledWith.length).to.be.equal(times);
        for (let i = 0; i < times; i++) {
            chai_1.expect(condition.actualDataThatWasCalledWith[i]).to.be.equal(data[i]);
        }
    }
    function verifyConditionWasCalledOnce(condition, data) {
        verifyConditionWasCalledXTimes(1, condition, [data]);
    }
    function verifyConditionWasNeverCalled(condition) {
        verifyConditionWasCalledXTimes(0, condition, []);
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
                event.raise({});
            });
            it('raising on registered event should raise event on all registratios', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handler3 = createEventHandler();
                const data = createData();
                event.on(handler1);
                event.on(handler2);
                event.on(handler3);
                event.raise(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyEventHandlerWasRaisedOnce(handler2, data);
                verifyEventHandlerWasRaisedOnce(handler3, data);
            });
            it('registering twice with same event handler, raising, should raise once', () => {
                const handler = createEventHandler();
                const data = createData();
                event.on(handler);
                event.on(handler);
                event.raise(data);
                verifyEventHandlerWasRaisedOnce(handler, data);
            });
            it('registering event handler that throws an error should throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                const data = createData();
                event.on(throwingHandler);
                const raisingAction = () => event.raise(data);
                chai_1.expect(raisingAction).to.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
            });
            it('registering event handler that throws an error should not raise the next event handler', () => {
                const throwingHandler = createThrowingEventHandler();
                const handler = createEventHandler();
                const data = createData();
                event.on(throwingHandler);
                event.on(handler);
                const raisingAction = () => event.raise(data);
                chai_1.expect(raisingAction).to.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
                verifyEventHandlerWasNeverRaised(handler);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const handlerToUnregister = createEventHandler();
                const data = createData();
                event.on(handler);
                event.on(handlerToUnregister);
                event.off(handlerToUnregister);
                event.raise(data);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('unregistering event handler should raise the not ramoved event handlers', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handlerToUnregister = createEventHandler();
                const handler3 = createEventHandler();
                const handler4 = createEventHandler();
                const data = createData();
                event.on(handler1);
                event.on(handler2);
                event.on(handlerToUnregister);
                event.on(handler3);
                event.on(handler4);
                event.off(handlerToUnregister);
                event.raise(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyEventHandlerWasRaisedOnce(handler2, data);
                verifyEventHandlerWasRaisedOnce(handler3, data);
                verifyEventHandlerWasRaisedOnce(handler4, data);
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
                const data = createData();
                event.on(handler1, trueCondition);
                event.on(handler2, falseCondition);
                event.on(handler3, trueCondition);
                event.raise(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyEventHandlerWasNeverRaised(handler2);
                verifyEventHandlerWasRaisedOnce(handler3, data);
                verifyConditionWasCalledXTimes(2, trueCondition, [data, data]);
                verifyConditionWasCalledOnce(falseCondition, data);
            });
            it('raising should call the condition once', () => {
                const handler = createEventHandler();
                const trueCondition = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, trueCondition);
                event.raise(data);
                verifyConditionWasCalledOnce(trueCondition, data);
            });
            it('registering twice with same event handler and same condition, raising, should raise once', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition);
                event.on(handler, condition);
                event.raise(data);
                verifyEventHandlerWasRaisedOnce(handler, data);
                verifyConditionWasCalledOnce(condition, data);
            });
            it('registering twice with same event handler and different condition, raising, should raise twice', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.raise(data);
                verifyConditionWasCalledOnce(condition1, data);
                verifyConditionWasCalledOnce(condition2, data);
                verifyEventHandlerWasRaisedXTimes(2, handler, [data, data]);
            });
            it('registering event handler that throws an error should throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition = createConditionWithReturnValue(true);
                const data = createData();
                event.on(throwingHandler, condition);
                const raisingAction = () => event.raise(data);
                chai_1.expect(raisingAction).to.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
                verifyConditionWasCalledOnce(condition, data);
            });
            it('registering event handler with condition that throws an error should throw error', () => {
                const eventHandler = createEventHandler();
                const throwingCondition = createThrowintCondition();
                const data = createData();
                event.on(eventHandler, throwingCondition);
                const raisingAction = () => event.raise(data);
                chai_1.expect(raisingAction).to.throw();
                verifyConditionWasCalledOnce(throwingCondition, data);
                verifyEventHandlerWasNeverRaised(eventHandler);
            });
            it('registering event handler that throws an error should not raise the next event handler or condition', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const handler = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(throwingHandler, condition1);
                event.on(handler, condition2);
                const raisingAction = () => event.raise(data);
                chai_1.expect(raisingAction).to.throw();
                verifyConditionWasCalledOnce(condition1, data);
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
                verifyConditionWasNeverCalled(condition2);
                verifyEventHandlerWasNeverRaised(handler);
            });
            it('registering event handler with condition that throws an error should not raise the next event handler or condition', () => {
                const handler1 = createThrowingEventHandler();
                const throwingCondition = createThrowintCondition();
                const handler2 = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler1, throwingCondition);
                event.on(handler2, condition2);
                const raisingAction = () => event.raise(data);
                chai_1.expect(raisingAction).to.throw();
                verifyConditionWasCalledOnce(throwingCondition, data);
                verifyEventHandlerWasNeverRaised(handler1);
                verifyConditionWasNeverCalled(condition2);
                verifyEventHandlerWasNeverRaised(handler2);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                const handlerToUnregister = createEventHandler();
                const conditionOfHandlerToUnregister = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.off(handlerToUnregister);
                event.raise(data);
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
                const data = createData();
                event.on(handler1, condition1);
                event.on(handler2, condition2);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.on(handler3, condition3);
                event.on(handler4, condition4);
                event.off(handlerToUnregister);
                event.raise(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyConditionWasCalledOnce(condition1, data);
                verifyEventHandlerWasRaisedOnce(handler2, data);
                verifyConditionWasCalledOnce(condition2, data);
                verifyEventHandlerWasRaisedOnce(handler3, data);
                verifyConditionWasCalledOnce(condition3, data);
                verifyEventHandlerWasRaisedOnce(handler4, data);
                verifyConditionWasCalledOnce(condition4, data);
                verifyConditionWasNeverCalled(conditionOfHandlerToUnregister);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('registering same handler with different conditions, unregister without condition, raise, should not raise', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const condition3 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler);
                event.raise(data);
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
                const data = createData();
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler, condition2);
                event.raise(data);
                verifyConditionWasCalledOnce(condition1, data);
                verifyConditionWasNeverCalled(condition2);
                verifyConditionWasCalledOnce(condition3, data);
                verifyEventHandlerWasRaisedXTimes(2, handler, [data, data]);
            });
        });
    });
    describe('raiseSafe', () => {
        describe('no condition', () => {
            it('raising unregistered event should not throw errors', () => {
                event.raiseSafe({});
            });
            it('raising on registered event should raise event on all registratios', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handler3 = createEventHandler();
                const data = createData();
                event.on(handler1);
                event.on(handler2);
                event.on(handler3);
                event.raiseSafe(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyEventHandlerWasRaisedOnce(handler2, data);
                verifyEventHandlerWasRaisedOnce(handler3, data);
            });
            it('registering twice with same event handler, raising, should raise once', () => {
                const handler = createEventHandler();
                const data = createData();
                event.on(handler);
                event.on(handler);
                event.raiseSafe(data);
                verifyEventHandlerWasRaisedOnce(handler, data);
            });
            it('registering event handler that throws an error should not throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                const data = createData();
                event.on(throwingHandler);
                const raisingAction = () => event.raiseSafe(data);
                chai_1.expect(raisingAction).to.not.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
            });
            it('registering event handler that throws an error should raise the next event handler', () => {
                const throwingHandler = createThrowingEventHandler();
                const handler = createEventHandler();
                const data = createData();
                event.on(throwingHandler);
                event.on(handler);
                const raisingAction = () => event.raiseSafe(data);
                chai_1.expect(raisingAction).to.not.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
                verifyEventHandlerWasRaisedOnce(handler, data);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const handlerToUnregister = createEventHandler();
                const data = createData();
                event.on(handler);
                event.on(handlerToUnregister);
                event.off(handlerToUnregister);
                event.raiseSafe(data);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('unregistering event handler should raise the not ramoved event handlers', () => {
                const handler1 = createEventHandler();
                const handler2 = createEventHandler();
                const handlerToUnregister = createEventHandler();
                const handler3 = createEventHandler();
                const handler4 = createEventHandler();
                const data = createData();
                event.on(handler1);
                event.on(handler2);
                event.on(handlerToUnregister);
                event.on(handler3);
                event.on(handler4);
                event.off(handlerToUnregister);
                event.raiseSafe(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyEventHandlerWasRaisedOnce(handler2, data);
                verifyEventHandlerWasRaisedOnce(handler3, data);
                verifyEventHandlerWasRaisedOnce(handler4, data);
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
                const data = createData();
                event.on(handler1, trueCondition);
                event.on(handler2, falseCondition);
                event.on(handler3, trueCondition);
                event.raiseSafe(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyEventHandlerWasNeverRaised(handler2);
                verifyEventHandlerWasRaisedOnce(handler3, data);
                verifyConditionWasCalledXTimes(2, trueCondition, [data, data]);
                verifyConditionWasCalledOnce(falseCondition, data);
            });
            it('raising should call the condition once', () => {
                const handler = createEventHandler();
                const trueCondition = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, trueCondition);
                event.raiseSafe(data);
                verifyConditionWasCalledOnce(trueCondition, data);
            });
            it('registering twice with same event handler and same condition, raising, should raise once', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition);
                event.on(handler, condition);
                event.raiseSafe(data);
                verifyEventHandlerWasRaisedOnce(handler, data);
                verifyConditionWasCalledOnce(condition, data);
            });
            it('registering twice with same event handler and different condition, raising, should raise twice', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.raiseSafe(data);
                verifyEventHandlerWasRaisedXTimes(2, handler, [data, data]);
                verifyConditionWasCalledOnce(condition1, data);
                verifyConditionWasCalledOnce(condition2, data);
            });
            it('registering event handler that throws an error should not throw error', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition = createConditionWithReturnValue(true);
                const data = createData();
                event.on(throwingHandler, condition);
                const raisingAction = () => event.raiseSafe(data);
                chai_1.expect(raisingAction).to.not.throw();
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
                verifyConditionWasCalledOnce(condition, data);
            });
            it('registering event handler with condition that throws an error should not throw error', () => {
                const eventHandler = createEventHandler();
                const throwingCondition = createThrowintCondition();
                const data = createData();
                event.on(eventHandler, throwingCondition);
                const raisingAction = () => event.raiseSafe(data);
                chai_1.expect(raisingAction).to.not.throw();
                verifyConditionWasCalledOnce(throwingCondition, data);
                verifyEventHandlerWasNeverRaised(eventHandler);
            });
            it('registering event handler that throws an error should raise the next event handler or condition', () => {
                const throwingHandler = createThrowingEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const handler = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(throwingHandler, condition1);
                event.on(handler, condition2);
                const raisingAction = () => event.raiseSafe(data);
                chai_1.expect(raisingAction).to.not.throw();
                verifyConditionWasCalledOnce(condition1, data);
                verifyEventHandlerWasRaisedOnce(throwingHandler, data);
                verifyConditionWasCalledOnce(condition2, data);
                verifyEventHandlerWasRaisedOnce(handler, data);
            });
            it('registering event handler with condition that throws an error should raise the next event handler or condition', () => {
                const handler1 = createThrowingEventHandler();
                const throwingCondition = createThrowintCondition();
                const handler2 = createEventHandler();
                const condition2 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler1, throwingCondition);
                event.on(handler2, condition2);
                const raisingAction = () => event.raiseSafe(data);
                chai_1.expect(raisingAction).to.not.throw();
                verifyConditionWasCalledOnce(throwingCondition, data);
                verifyEventHandlerWasNeverRaised(handler1);
                verifyConditionWasCalledOnce(condition2, data);
                verifyEventHandlerWasRaisedOnce(handler2, data);
            });
            it('unregistering event handler should not raise it', () => {
                const handler = createEventHandler();
                const condition = createConditionWithReturnValue(true);
                const handlerToUnregister = createEventHandler();
                const conditionOfHandlerToUnregister = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.off(handlerToUnregister);
                event.raiseSafe(data);
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
                const data = createData();
                event.on(handler1, condition1);
                event.on(handler2, condition2);
                event.on(handlerToUnregister, conditionOfHandlerToUnregister);
                event.on(handler3, condition3);
                event.on(handler4, condition4);
                event.off(handlerToUnregister);
                event.raiseSafe(data);
                verifyEventHandlerWasRaisedOnce(handler1, data);
                verifyConditionWasCalledOnce(condition1, data);
                verifyEventHandlerWasRaisedOnce(handler2, data);
                verifyConditionWasCalledOnce(condition2, data);
                verifyEventHandlerWasRaisedOnce(handler3, data);
                verifyConditionWasCalledOnce(condition3, data);
                verifyEventHandlerWasRaisedOnce(handler4, data);
                verifyConditionWasCalledOnce(condition4, data);
                verifyConditionWasNeverCalled(conditionOfHandlerToUnregister);
                verifyEventHandlerWasNeverRaised(handlerToUnregister);
            });
            it('registering same handler with different conditions, unregister without condition, raise, should not raise', () => {
                const handler = createEventHandler();
                const condition1 = createConditionWithReturnValue(true);
                const condition2 = createConditionWithReturnValue(true);
                const condition3 = createConditionWithReturnValue(true);
                const data = createData();
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler);
                event.raiseSafe(data);
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
                const data = createData();
                event.on(handler, condition1);
                event.on(handler, condition2);
                event.on(handler, condition3);
                event.off(handler, condition2);
                event.raiseSafe(data);
                verifyConditionWasCalledOnce(condition1, data);
                verifyConditionWasNeverCalled(condition2);
                verifyConditionWasCalledOnce(condition3, data);
                verifyEventHandlerWasRaisedXTimes(2, handler, [data, data]);
            });
        });
    });
});
//# sourceMappingURL=conditionalEventT.test.js.map