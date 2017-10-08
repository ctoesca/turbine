"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventT_1 = require("./eventT");
class Event {
    constructor() {
        this._eventT = new eventT_1.EventT();
    }
    on(eventHandler) {
        this._eventT.on(eventHandler);
    }
    off(eventHandler) {
        this._eventT.off(eventHandler);
    }
    raise() {
        this._eventT.raise({});
    }
    raiseSafe() {
        this._eventT.raiseSafe({});
    }
}
exports.Event = Event;
//# sourceMappingURL=event.js.map