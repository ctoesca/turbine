"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conditionalEventT_1 = require("./conditionalEventT");
class EventT {
    constructor() {
        this._conditionalEventT = new conditionalEventT_1.ConditionalEventT();
    }
    on(eventHandler) {
        this._conditionalEventT.on(eventHandler);
    }
    off(eventHandler) {
        this._conditionalEventT.off(eventHandler);
    }
    raise(data) {
        this._conditionalEventT.raise(data);
    }
    raiseSafe(data) {
        this._conditionalEventT.raiseSafe(data);
    }
}
exports.EventT = EventT;
//# sourceMappingURL=eventT.js.map