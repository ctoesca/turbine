"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const event_1 = require("./event");
describe('Event', () => {
    let event;
    beforeEach(() => {
        event = new event_1.Event();
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
    function verifyEventHandlerWasRaisedOnce(eventHandler) {
        chai_1.expect(eventHandler.numberOfTimesCalled).to.be.equal(1);
    }
    function verifyEventHandlerWasNeverRaised(eventHandler) {
        chai_1.expect(eventHandler.numberOfTimesCalled).to.be.equal(0);
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
    describe('raiseSafe', () => {
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
});
//# sourceMappingURL=event.test.js.map