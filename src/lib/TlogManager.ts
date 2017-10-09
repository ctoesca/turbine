import shell = require('shelljs');
import path = require('path');
import tools = require('./tools');
import * as Logger from "bunyan";

export class TlogManager  {

    config: any = null;
    _loggers = {};
    logsConfig: any = null;

    constructor(config) {
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
                        stream.path = tools.replaceEnvVars(stream.path);
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
    getLogger(name: string = null):Logger {
        if (name == null)
            name = "Main";
        if (typeof this._loggers[name] == "undefined") {
            var loggerConf = this.getLogsConfig().logger;
            loggerConf.name = name;
            this._loggers[name] = Logger.createLogger(loggerConf);
        }
        return this._loggers[name];
    }
}
