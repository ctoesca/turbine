import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tevent } from '../events/Tevent';
import { IclusterManager } from './IclusterManager';
import * as tools from '../tools';

import cluster = require("cluster");
import uuid = require("uuid");
import os = require("os");
import Redis = require("ioredis");
import FakeRedis = require("fakeredis")

export class TclusterManager  extends TeventDispatcher implements IclusterManager {

    config: any;
    redisErrors: number = 0;
    app: any;
    workers: object = {};
    keyPrefix: string;
    workerInfos: any;
    logger: any;
    localMasterPid: number;
    client: any;
    timerInterval: number = 5000;
    maxActivityInterval: number = 5000 * 2;
    nodeID: any = uuid.v4();
    oneProcessPerServerTimer: tools.Ttimer;

    constructor(app, config) {
        super();

        this.app = app;
        this.config = config;
        this.workerInfos = {
            id: this.getThisWorkerId(),
            pid: process.pid,
            host: os.hostname(),
            isClusterMaster: false,
            isServerMaster: false,
            lastActivity: null
        };
        Redis.Promise.onPossiblyUnhandledRejection(this.onPossiblyUnhandledRejection.bind(this));
    }

    get isMasterProcess(): boolean{
      return cluster.isMaster
    }

    get isClusterMaster(): boolean {
        return this.workerInfos.isClusterMaster;
    }
    get isServerMaster(): boolean {
        return this.workerInfos.isServerMaster;
    }
    onPossiblyUnhandledRejection(error) {
        this.redisErrors++;
        if (this.logger)
            this.logger.error(error.toString());
    }
    start() {
        this.logger = this.app.getLogger(this.constructor.name);
        this.localMasterPid = null;
        if (cluster.isMaster) {
            this.client = this.getNewClient();
            this.client.del("workers")

            this.logger.info("HOSTNAME = " + os.hostname());
            this.logger.info("NOMBRE DE COEURS: " + os.cpus().length);
            var sendToAllWorkers = function (message) {
                for (var i in cluster.workers) {
                    try {
                        cluster.workers[i].send(message);
                    }
                    catch (err) {
                    }
                }
            };
            cluster.on('message', (worker, message, handle) => {
                this.logger.debug("ON CLUSTER MESSAGE from " + worker.process.pid);
                sendToAllWorkers(message);
            });
            for (var i = 0; i < this.config.numProcesses; i++) {
                var isFirstWorker = 0;
                if (i == 0)
                    isFirstWorker = 1;
                cluster.fork({
                    isFirstWorker: isFirstWorker,
                    isWorker: true
                });
            }
            cluster.on('disconnect', function (worker) {
                this.logger.warn(`worker ${worker.id} disconnected`);
                cluster.fork({
                    isFirstWorker: false,
                    isWorker: true
                });
                if (this.localMasterPid == worker.process.pid) {
                    this.logger.info("*** LOCAL MASTER KILLED ****");
                    this.localMasterPid = null;
                    var message = { message: "!!!!!!!!!!!!!!!! LOCAL MASTER KILLED !!!!!!!!!!!!!!!" };
                    sendToAllWorkers(JSON.stringify(message));
                }
            }.bind(this));
            cluster.on('exit', (worker, code, signal) => {
                this.logger.warn(`worker ${worker.process.pid} died code=` + code);
            });
            cluster.on('fork', function (worker) {
                this.logger.info("************ FORK WORKER **************");
                if (this.localMasterPid == null) {
                    this.localMasterPid = worker.process.pid;
                    this.logger.info("*** LOCAL MASTER PID = " + this.localMasterPid + " ****");
                }
            }.bind(this));
        }
        else {
            process.on('message', this.onLocalClusterMessage.bind(this));
            setTimeout(function () {
                this.dispatchEvent(new Tevent("WORKER_CREATED", process));
            }.bind(this), 10);
            this.initOnWorker();
        }
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

                    if (w.id == this.getThisWorkerId()){
                      thisWorkerIsRegistrerer = true
                    }

                    var diff = now.getTime() - w.lastActivity;
                    var timeout = (this.maxActivityInterval+tools.randomBetween(0, this.maxActivityInterval) )
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
                            if (currentServerMaster == null) {
                                currentServerMaster = w;
                            }
                        }
                    }
                }

                if (currentClusterMaster == null) {
                  this.workerInfos.isClusterMaster = true;
                  this.logger.info("currentClusterMaster=null, ISMASTER_CHANGED => true");
                  this.dispatchEvent(new Tevent("ISMASTER_CHANGED", true));
                }
                else {
                  if ((currentClusterMaster.id != this.getThisWorkerId()) && this.workerInfos.isClusterMaster) {
                    this.workerInfos.isClusterMaster = false;
                    this.dispatchEvent(new Tevent("ISMASTER_CHANGED", false));
                    this.logger.info("currentClusterMaster.id=" + currentClusterMaster.id + ", this.workerInfos=", this.workerInfos, " ISMASTER_CHANGED => false");
                  }
                }
                if (currentServerMaster == null) {
                  this.workerInfos.isServerMaster = true;
                  this.dispatchEvent(new Tevent("MASTER_SERVER_PROCESS_CHANGED", true));
                }
                else {
                  if ((currentServerMaster.id != this.getThisWorkerId()) && this.workerInfos.isServerMaster) {
                    this.workerInfos.isServerMaster = false;
                    this.dispatchEvent(new Tevent("MASTER_SERVER_PROCESS_CHANGED", false));
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
        return os.hostname() + "_" + process.pid;
    }
    getClusterWorkers() {
        return cluster.workers;
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
    initOnWorker() {
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
    onLocalClusterMessage(message) {
        var message = JSON.parse(message);
        this.logger.info("onLocalClusterMessage on worker " + process.pid, message);
    }
    getNewClient(db = null) {
        var redisConfig = this.config.redis;
        var r = null;
        if (redisConfig.useFake) {
            this.logger.warn("Creating FAKE redis client");
            r = FakeRedis.createClient("test");
        }
        else {
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
                this.logger.debug("Creating redis client");
                r = new Redis(options);
            }
        }
        return r;
    }
    getClient() {
        return this.client;
    }
}
