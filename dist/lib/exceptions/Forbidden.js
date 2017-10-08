"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TurbineException_1 = require("./TurbineException");
class Forbidden extends TurbineException_1.TurbineException {
    constructor(message = null, code = 0) {
        if (!message)
            message = "Forbidden";
        super(message, code);
    }
}
exports.Forbidden = Forbidden;
//# sourceMappingURL=Forbidden.js.map