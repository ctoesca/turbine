"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tevent {
    constructor(type, eventData = null, cancelable = true) {
        this.type = null;
        this.data = null;
        this.cancelable = false;
        this.currentTarget = null;
        this.cancelled = false;
        this.defaultPrevented = false;
        this.bind = null;
        this.relatedData = null;
        if (arguments.length > 0)
            this.type = type;
        if (arguments.length > 1)
            this.data = eventData;
        if (arguments.length > 2)
            this.cancelable = cancelable;
    }
    preventDefault() {
        this.defaultPrevented = true;
    }
}
exports.Tevent = Tevent;
//# sourceMappingURL=Tevent.js.map