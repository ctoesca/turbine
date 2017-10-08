"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TurbineException extends Error {
    constructor(message, code = 0) {
        super(message);
        this.code = 0;
        if (arguments.length > 1)
            this.code = code;
        else
            this.code = 1;
    }
}
exports.TurbineException = TurbineException;
//# sourceMappingURL=TurbineException.js.map