"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const bunyan = require("bunyan");
const shell = require("shelljs");
const path = require("path");
const utils = require("./tools");
class TlogManager extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.config = null;
        this._loggers = {};
        this.logsConfig = null;
        this.config = config;
    }
    getDefaultLogConfig() {
        var r = {
            "logger": {
                "level": "info",
                "streams": [
                    {
                        "stream": process.stdout
                    },
                    {
                        "type": "rotating-file",
                        "period": "1d",
                        "count": 7,
                        "path": __dirname + "/../logs/log.json"
                    }
                ]
            }
        };
        return r;
    }
    getLogsConfig() {
        if (this.logsConfig == null) {
            if (!this.config) {
                this.logsConfig = this.getDefaultLogConfig();
            }
            else {
                this.logsConfig = this.config;
                for (var i = 0; i < this.logsConfig.logger.streams.length; i++) {
                    var stream = this.logsConfig.logger.streams[i];
                    if (stream.path) {
                        stream.path = utils.replaceEnvVars(stream.path);
                        var dir = path.dirname(stream.path);
                        try {
                            shell.mkdir('-p', dir);
                        }
                        catch (e) {
                            if (e.code != 'EEXIST')
                                throw e;
                        }
                    }
                }
            }
        }
        return this.logsConfig;
    }
    getLogger(name = null) {
        if (name == null)
            name = "Main";
        if (typeof this._loggers[name] == "undefined") {
            var loggerConf = this.getLogsConfig().logger;
            loggerConf.name = name;
            this._loggers[name] = bunyan.createLogger(loggerConf);
        }
        return this._loggers[name];
    }
}
exports.TlogManager = TlogManager;
//# sourceMappingURL=TlogManager.js.map