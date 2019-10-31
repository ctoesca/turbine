"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("../events/TeventDispatcher");
const Tevent_1 = require("../events/Tevent");
const tools = require("../tools");
const uuid = require("uuid");
const os = require("os");
const Redis = require("ioredis");
const Promise = require("bluebird");
Redis.Promise = Promise;
class TclusterManager extends TeventDispatcher_1.TeventDispatcher {
    constructor(app, config) {
        super();
        this.redisErrors = 0;
        this.workers = {};
        this.timerInterval = 5000;
        this.maxActivityInterval = 5000 * 2;
        this.nodeID = uuid.v4();
        this.app = app;
        this.config = config;
        this.workerInfos = {
            id: this.getThisWorkerId(),
            pid: process.pid,
            host: this.getHostName(),
            isClusterMaster: false,
            isServerMaster: false,
            lastActivity: null
        };
        Redis.Promise.onPossiblyUnhandledRejection(this.onPossiblyUnhandledRejection.bind(this));
    }
    getRedisErrorsCount() {
        return this.redisErrors;
    }
    get isClusterMaster() {
        return this.workerInfos.isClusterMaster;
    }
    get isServerMaster() {
        return this.workerInfos.isServerMaster;
    }
    onPossiblyUnhandledRejection(error) {
        this.redisErrors++;
        if (this.logger) {
            this.logger.error("onPossiblyUnhandledRejection : ", error);
            if (error && error.stack)
                this.logger.error(error.stack);
        }
    }
    getHostName() {
        if (this.config.localhostName)
            return this.config.localhostName;
        else
            return os.hostname();
    }
    start() {
        this.logger = this.app.getLogger(this.constructor.name);
        this.nodeID = uuid.v4();
        this.logger.debug(this.constructor.name + " created: opt=", this.config);
        this.logger.debug("NODEID=" + this.nodeID);
        this.client = this.getNewClient();
        this.client.on("error", function (err) {
            this.logger.error("REDIS Error " + err.toString());
            this.redisErrors++;
        }.bind(this));
        this.client.on("ready", function (data) {
            this.logger.debug("REDIS ready");
        }.bind(this));
        this.client.on("connect", function (data) {
            this.logger.debug("REDIS connected");
        }.bind(this));
        this.client.on("reconnecting", function (data) {
            this.logger.debug("REDIS reconnecting. data=", data);
        }.bind(this));
        this.client.on("close", function (data) {
            this.logger.debug("REDIS close");
        }.bind(this));
        this.client.on("end", function (data) {
            this.logger.debug("REDIS end");
        }.bind(this));
        this.oneProcessPerServerTimer = new tools.Ttimer({ delay: this.timerInterval });
        this.oneProcessPerServerTimer.on(tools.Ttimer.ON_TIMER, this.onTimer, this);
        this.oneProcessPerServerTimer.start();
    }
    onTimer() {
        this.client.hgetall("workers", function (err, result) {
            if (err == null) {
                var now = new Date();
                this.workers = {};
                var currentServerMaster = null;
                var currentClusterMaster = null;
                var thisWorkerIsRegistrerer = false;
                for (var k in result) {
                    var w = JSON.parse(result[k]);
                    this.workers[k] = w;
                    if (w.id == this.getThisWorkerId()) {
                        thisWorkerIsRegistrerer = true;
                    }
                    var diff = now.getTime() - w.lastActivity;
                    var timeout = (this.maxActivityInterval + tools.randomBetween(0, this.maxActivityInterval));
                    var timedout = (diff > timeout);
                    if (timedout) {
                        this.client.hdel("workers", w.id);
                    }
                    else {
                        if (w.isClusterMaster === true) {
                            if (currentClusterMaster == null) {
                                currentClusterMaster = w;
                            }
                        }
                        if (w.isServerMaster === true) {
                            if ((currentServerMaster == null) && (w.host == this.workerInfos.host)) {
                                currentServerMaster = w;
                            }
                        }
                    }
                }
                if (currentClusterMaster == null) {
                    this.workerInfos.isClusterMaster = true;
                    this.logger.info("currentClusterMaster=null, ISMASTER_CHANGED => true");
                    this.dispatchEvent(new Tevent_1.Tevent("ISMASTER_CHANGED", true));
                }
                else {
                    if ((currentClusterMaster.id != this.getThisWorkerId()) && this.workerInfos.isClusterMaster) {
                        this.workerInfos.isClusterMaster = false;
                        this.dispatchEvent(new Tevent_1.Tevent("ISMASTER_CHANGED", false));
                        this.logger.info("currentClusterMaster.id=" + currentClusterMaster.id + ", this.workerInfos=", this.workerInfos, " ISMASTER_CHANGED => false");
                    }
                }
                if (currentServerMaster == null) {
                    this.workerInfos.isServerMaster = true;
                    this.dispatchEvent(new Tevent_1.Tevent("MASTER_SERVER_PROCESS_CHANGED", true));
                }
                else {
                    if ((currentServerMaster.id != this.getThisWorkerId()) && this.workerInfos.isServerMaster) {
                        this.workerInfos.isServerMaster = false;
                        this.dispatchEvent(new Tevent_1.Tevent("MASTER_SERVER_PROCESS_CHANGED", false));
                    }
                }
                this.saveWorker(this.workerInfos);
            }
            else {
                this.logger.error("onTimer: " + err);
            }
        }.bind(this));
    }
    getThisWorkerId() {
        return this.getHostName() + "_" + process.pid;
    }
    saveWorker(w, callback, error) {
        w.lastActivity = new Date().getTime();
        var data = JSON.stringify(w);
        this.client.hset("workers", w.id, data, function (err, result) {
            if (err == null) {
                if (callback)
                    callback();
            }
            else {
                this.logger.error(err);
                if (error)
                    error();
            }
        }.bind(this));
    }
    onLocalClusterMessage(message) {
        var message = JSON.parse(message);
        this.logger.info("onLocalClusterMessage on worker " + process.pid, message);
    }
    getNewClient(db = null) {
        var redisConfig = this.config.redis;
        var r = null;
        if (redisConfig.isCluster) {
            this.logger.debug("Creating cluster redis client");
            if (!redisConfig.clusterConfig.options.keyPrefix)
                redisConfig.clusterConfig.options.keyPrefix = this.config.clusterName;
            this.keyPrefix = redisConfig.clusterConfig.options.keyPrefix;
            r = new Redis.Cluster(redisConfig.clusterConfig.hosts, redisConfig.clusterConfig.options);
        }
        else {
            var options = JSON.parse(JSON.stringify(redisConfig.normalConfig));
            if (arguments.length > 0)
                options.db = db;
            if (!options.keyPrefix)
                options.keyPrefix = this.config.clusterName;
            this.keyPrefix = options.keyPrefix;
            this.logger.debug("Creating redis client - keyPrefix = " + options.keyPrefix);
            r = new Redis(options);
        }
        return r;
    }
    getClient() {
        return this.client;
    }
}
exports.TclusterManager = TclusterManager;
//# sourceMappingURL=TclusterManager.js.map