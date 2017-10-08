"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conditionalEventT_1 = require("./conditionalEventT");
class ConditionalEvent {
    constructor() {
        this._conditionalEventT = new conditionalEventT_1.ConditionalEventT();
    }
    on(eventHandler, condition) {
        this._conditionalEventT.on(eventHandler, condition);
    }
    off(eventHandler, condition) {
        this._conditionalEventT.off(eventHandler, condition);
    }
    raise() {
        this._conditionalEventT.raise({});
    }
    raiseSafe() {
        this._conditionalEventT.raiseSafe({});
    }
}
exports.ConditionalEvent = ConditionalEvent;
//# sourceMappingURL=conditionalEvent.js.map