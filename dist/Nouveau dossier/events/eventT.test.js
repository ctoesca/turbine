"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const eventT_1 = require("./eventT");
describe('EventT', () => {
    let event;
    beforeEach(() => {
        event = new eventT_1.EventT();
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
    function createData() {
        return {
            1: 'some data1',
            2: 'some data2'
        };
    }
    function verifyEventHandlerWasRaisedOnce(eventHandler, data) {
        chai_1.expect(eventHandler.actualDataThatWasCalledWith.length).to.be.equal(1);
        chai_1.expect(eventHandler.actualDataThatWasCalledWith[0]).to.be.equal(data);
    }
    function verifyEventHandlerWasNeverRaised(eventHandler) {
        chai_1.expect(eventHandler.actualDataThatWasCalledWith.length).to.be.equal(0);
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
    describe('raiseSafe', () => {
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
});
//# sourceMappingURL=eventT.test.js.map