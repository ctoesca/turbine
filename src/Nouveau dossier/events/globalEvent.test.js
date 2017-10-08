"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalEvent_1 = require("./globalEvent");
const chai_1 = require("chai");
class EventSubscriber {
    constructor() {
        this.eventCallbackArgs = [];
        this.throwingEventCallbackArgs = [];
        const globalEvent = new globalEvent_1.GlobalEvent();
        globalEvent.on(EventSubscriber.REGULAR_EVENT_NAME, this.eventCallback.bind(this));
        globalEvent.on(EventSubscriber.THROWING_EVENT_NAME, this.throwingEventCallback.bind(this));
    }
    eventCallback(data) {
        this.eventCallbackArgs.push(data);
    }
    throwingEventCallback(data) {
        this.throwingEventCallbackArgs.push(data);
        throw 'some error';
    }
}
EventSubscriber.REGULAR_EVENT_NAME = 'regular event name';
EventSubscriber.THROWING_EVENT_NAME = 'throwing event name';
describe('GlobalEvent', () => {
    let globalEvent;
    let eventSubscriber;
    beforeEach(() => {
        eventSubscriber = new EventSubscriber();
    });
    beforeEach(() => {
        globalEvent = new globalEvent_1.GlobalEvent();
    });
    afterEach(() => {
        globalEvent.clearAllSubscribtions(EventSubscriber.REGULAR_EVENT_NAME);
        globalEvent.clearAllSubscribtions(EventSubscriber.THROWING_EVENT_NAME);
    });
    it('raising global event with not existing name should not call the callbacks', () => {
        globalEvent.raise('non existing name', 1);
        chai_1.expect(eventSubscriber.eventCallbackArgs).to.be.length(0);
        chai_1.expect(eventSubscriber.throwingEventCallbackArgs).to.be.length(0);
    });
    it('raising regular event should raise only the regular event', () => {
        const data = 12;
        globalEvent.raise(EventSubscriber.REGULAR_EVENT_NAME, data);
        chai_1.expect(eventSubscriber.eventCallbackArgs).to.be.deep.equal([data]);
        chai_1.expect(eventSubscriber.throwingEventCallbackArgs).to.be.length(0);
    });
    it('raising throwing event should throw an error', () => {
        const data = 'aaa';
        const action = () => globalEvent.raise(EventSubscriber.THROWING_EVENT_NAME, data);
        chai_1.expect(action).to.throw('some error');
        chai_1.expect(eventSubscriber.eventCallbackArgs).to.be.length(0);
        chai_1.expect(eventSubscriber.throwingEventCallbackArgs).to.be.deep.equal([data]);
    });
    it('raising safely a throwing event should not throw an error', () => {
        const data = 'aaa';
        const action = () => globalEvent.raiseSafe(EventSubscriber.THROWING_EVENT_NAME, data);
        chai_1.expect(action).to.not.throw();
        chai_1.expect(eventSubscriber.eventCallbackArgs).to.be.length(0);
        chai_1.expect(eventSubscriber.throwingEventCallbackArgs).to.be.deep.equal([data]);
    });
    it('raising an event after unsubscribing from it should not raise it', () => {
        const eventName = 'event name';
        let numberOfTimesRaised = 0;
        const eventHandler = () => numberOfTimesRaised++;
        globalEvent.on(eventName, eventHandler);
        globalEvent.off(eventName, eventHandler);
        globalEvent.raise(eventName);
        chai_1.expect(numberOfTimesRaised).to.be.equal(0);
    });
});
//# sourceMappingURL=globalEvent.test.js.map