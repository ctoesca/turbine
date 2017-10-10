"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("../events/TeventDispatcher");
class TdaoBase extends TeventDispatcher_1.TeventDispatcher {
    constructor(objectClassName, datasource, config) {
        super();
        this.objectClassName = objectClassName;
        this.config = config;
        this.datasource = datasource;
        this.logger = app.getLogger(this.constructor.name);
        this.logger.debug("Create DAO " + this.constructor.name);
    }
}
exports.TdaoBase = TdaoBase;
//# sourceMappingURL=TdaoBase.js.map