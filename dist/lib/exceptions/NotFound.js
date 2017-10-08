"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TurbineException_1 = require("./TurbineException");
class NotFound extends TurbineException_1.TurbineException {
    constructor(message = null, code = 0) {
        if (!message)
            message = "NotFound";
        super(message, code);
    }
}
exports.NotFound = NotFound;
//# sourceMappingURL=NotFound.js.map