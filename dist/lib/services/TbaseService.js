"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("../events/TeventDispatcher");
const shell = require("shell");
class TbaseService extends TeventDispatcher_1.TeventDispatcher {
    constructor(name, config) {
        super();
        this.name = null;
        this.config = null;
        this.started = false;
        this.active = false;
        this.executionPolicy = null;
        this.name = name;
        this.config = this.getDefaultConfig();
        if (config) {
            for (var k in config)
                this.config[k] = config[k];
        }
        this.executionPolicy = this.config.executionPolicy;
        this.active = this.config.active;
        try {
            if (typeof this.config.dataDir != "undefined")
                shell.mkdir('-p', this.config.dataDir);
        }
        catch (e) {
            if (e.code != 'EEXIST')
                throw e;
        }
        this.logger = app.getLogger(this.name);
        this.logger.info("Creation service '" + this.name + "'. executionPolicy=" + this.executionPolicy);
    }
    start() {
        if (this.active && !this.started) {
            this.logger.info("service '" + this.name + "' started.");
            this.started = true;
        }
    }
    stop() {
        if (this.started) {
            this.started = false;
            this.logger.info("service '" + this.name + "' stopped.");
        }
    }
}
exports.TbaseService = TbaseService;
//# sourceMappingURL=TbaseService.js.map