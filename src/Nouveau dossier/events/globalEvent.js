"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventT_1 = require("./eventT");
class GlobalEvent {
    on(eventName, eventHandler) {
        let event = this.getEvent(eventName);
        if (!event) {
            event = new eventT_1.EventT();
            GlobalEvent._globalEventsMap[eventName] = event;
        }
        event.on(eventHandler);
    }
    off(eventName, eventHandler) {
        const event = this.getEvent(eventName);
        if (event) {
            event.off(eventHandler);
        }
    }
    clearAllSubscribtions(eventName) {
        if (!!this.getEvent(eventName)) {
            delete GlobalEvent._globalEventsMap[eventName];
        }
    }
    raise(eventName, data) {
        const event = this.getEvent(eventName);
        if (event) {
            event.raise(data);
        }
    }
    raiseSafe(eventName, data) {
        const event = this.getEvent(eventName);
        if (event) {
            event.raiseSafe(data);
        }
    }
    getEvent(eventName) {
        return GlobalEvent._globalEventsMap[eventName];
    }
}
GlobalEvent._globalEventsMap = {};
exports.GlobalEvent = GlobalEvent;
//# sourceMappingURL=globalEvent.js.map