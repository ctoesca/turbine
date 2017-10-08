"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TurbineException_1 = require("./TurbineException");
class BadRequest extends TurbineException_1.TurbineException {
    constructor(message = null, code = 0) {
        if (!message)
            message = "Bad Request";
        if (!code)
            code = 400;
        super(message, code);
    }
}
exports.BadRequest = BadRequest;
//# sourceMappingURL=BadRequest.js.map