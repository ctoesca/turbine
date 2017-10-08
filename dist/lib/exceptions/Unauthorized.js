"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TurbineException_1 = require("./TurbineException");
class Unauthorized extends TurbineException_1.TurbineException {
    constructor(message = null, code = 0) {
        if (!message)
            message = "Unauthorized";
        super(message, code);
    }
}
exports.Unauthorized = Unauthorized;
//# sourceMappingURL=Unauthorized.js.map