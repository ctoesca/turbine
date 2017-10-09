"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TclusterManager_1 = require("./cluster/TclusterManager");
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const TlogManager_1 = require("./TlogManager");
const Promise = require("bluebird");
class Tapplication extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.appVersion = "1.0.0";
        this.config = null;
        this.services = [];
        this.logger = null;
        this.ClusterManager = null;
        this.config = config;
        if (!this.config.clusterName)
            this.config.clusterName = "turbine";
    }
    init() {
        this.logManager = new TlogManager_1.TlogManager(this.config.logs);
        this.logger = this.getLogger("Application");
        var clusterManagerClass = TclusterManager_1.TclusterManager;
        if (this.config.clusterManagerClass)
            clusterManagerClass = this.config.clusterManagerClass;
        this.ClusterManager = new clusterManagerClass(this, {
            clusterName: this.config.clusterName,
            numProcesses: this.config.numProcesses,
            redis: this.config.redis
        });
        this.ClusterManager.start();
        if (!this.ClusterManager.isMasterProcess) {
            this.logger.info("Node worker started (PID=" + process.pid + ")");
            this.ClusterManager.on("ISMASTER_CHANGED", this.onIsMasterChanged.bind(this));
            this.ClusterManager.on("MASTER_SERVER_PROCESS_CHANGED", this.onServerMasterChanged.bind(this));
            Promise.onPossiblyUnhandledRejection((error) => {
                this.logger.error("onPossiblyUnhandledRejection", error);
            });
            this.start();
        }
        else {
            this.logger.info("Node master started (PID=" + process.pid + ")");
        }
    }
    registerService(svc) {
        this.services.push(svc);
        if (svc.active && (svc.executionPolicy == "one_per_process"))
            svc.start();
        else
            svc.stop();
    }
    getService(name) {
        var r = null;
        for (var i = 0; i < this.services.length; i++) {
            var svc = this.services[i];
            if (svc.name == name) {
                r = svc;
                break;
            }
        }
        return r;
    }
    onServerMasterChanged(e) {
        if (e.data)
            this.logger.info("This worker becomes SERVER_MASTER");
        else
            this.logger.info("This worker is no longer SERVER_MASTER");
        for (var i = 0; i < this.services.length; i++) {
            var svc = this.services[i];
            if (svc.active && (svc.executionPolicy == "one_per_server")) {
                if (e.data)
                    svc.start();
                else
                    svc.stop();
            }
        }
    }
    onIsMasterChanged(e) {
        if (e.data)
            this.logger.info("This worker becomes MASTER");
        else
            this.logger.info("This worker is no longer MASTER");
        for (var i = 0; i < this.services.length; i++) {
            var svc = this.services[i];
            if (svc.executionPolicy == "one_in_cluster") {
                if (e.data)
                    svc.start();
                else
                    svc.stop();
            }
        }
    }
    getLogger(name) {
        return this.logManager.getLogger(name);
    }
    start() {
    }
}
exports.Tapplication = Tapplication;
//# sourceMappingURL=Tapplication.js.map