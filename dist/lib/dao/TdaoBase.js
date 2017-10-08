"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("../events/TeventDispatcher");
class TdaoBase extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.config = config;
        this.logger = app.getLogger(this.constructor.name);
        this.logger.debug("Create DAO " + this.constructor.name);
    }
}
exports.TdaoBase = TdaoBase;
//# sourceMappingURL=TdaoBase.js.map