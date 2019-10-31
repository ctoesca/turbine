"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const path = require("path");
const tools = require("./tools");
const Logger = require("bunyan");
const logrotate = require('logrotator');
class TlogManager {
    constructor(config) {
        this.config = null;
        this._loggers = new Map();
        this.logsConfig = null;
        this.config = config;
        this.rotator = logrotate.rotator;
        this.rotator.on('error', (err) => {
            console.log("Process " + process.pid + ': logrotator error : ' + err.toString());
        });
        this.rotator.on('rotate', (file) => {
            console.log("Process " + process.pid + ': file ' + file + ' was rotated!');
        });
    }
    onServerMasterChanged(data) {
        this.enableLogRotator(data);
    }
    enableLogRotator(data) {
        if (this.rotatorFile) {
            if (data) {
                this.rotator.register(this.rotatorFile, this.rotatorParams);
            }
            else {
                this.rotator.unregister(this.rotatorFile);
            }
        }
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
                        if (stream.type === 'logrotator') {
                            this.rotatorFile = stream.path;
                            this.rotatorParams = {
                                "schedule": stream.schedule,
                                "size": stream.size,
                                "compress": stream.compress,
                                "count": stream.count
                            };
                            this.enableLogRotator(app.ClusterManager && app.ClusterManager.isServerMaster);
                            this.logsConfig.logger.streams[i] = {
                                "type": "file",
                                "path": stream.path
                            };
                        }
                    }
                }
            }
        }
        return this.logsConfig;
    }
    getLogger(name = null, loggerConf = null) {
        if (name == null)
            name = "Main";
        let r = null;
        if (!this._loggers.has(name)) {
            if (loggerConf) {
                r = Logger.createLogger(loggerConf);
                this._loggers.set(name, r);
            }
            else {
                var loggerConf = this.getLogsConfig().logger;
                loggerConf.name = name;
                r = Logger.createLogger(loggerConf);
                this._loggers.set(name, r);
            }
        }
        else {
            r = this._loggers.get(name);
        }
        return r;
    }
}
exports.TlogManager = TlogManager;
//# sourceMappingURL=TlogManager.js.map