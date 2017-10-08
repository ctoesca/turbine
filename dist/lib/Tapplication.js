"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const TclusterManager_1 = require("./cluster/TclusterManager");
const TlogManager_1 = require("./TlogManager");
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
        this.logManager = new TlogManager_1.TlogManager(this.config.logs);
        this.logger = this.getLogger("Application");
        global.logger = this.getLogger("main");
        global.getLogger = this.getLogger.bind(this);
        var clusterManagerClass = TclusterManager_1.TclusterManager;
        if (this.config.clusterManagerClass)
            clusterManagerClass = this.config.clusterManagerClass;
        this.ClusterManager = new clusterManagerClass(this, {
            clusterName: this.config.clusterName,
            numProcesses: this.config.numProcesses,
            redis: this.config.redis
        });
        this.ClusterManager.start();
        this.ClusterManager.on("WORKER_CREATED", function (process) {
            var clazz = this.config.workerClass;
            global.app = new clazz(this.config);
            global.app.ClusterManager = this.ClusterManager;
            global.app.start();
        }.bind(this));
    }
    getLogger(name) {
        return this.logManager.getLogger(name);
    }
    start() {
        this.logger.info("Application started");
    }
}
exports.Tapplication = Tapplication;
//# sourceMappingURL=Tapplication.js.map