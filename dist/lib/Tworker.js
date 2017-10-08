"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const TlogManager_1 = require("./TlogManager");
const Promise = require("bluebird");
class Tworker extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.logManager = new TlogManager_1.TlogManager(this.config.logs);
        this.logger = this.getLogger("Tworker");
        global.logger = this.getLogger("main");
        global.getLogger = this.getLogger.bind(this);
        app.ClusterManager.on("ISMASTER_CHANGED", this.onIsMasterChanged.bind(this));
        app.ClusterManager.on("MASTER_SERVER_PROCESS_CHANGED", this.onServerMasterChanged.bind(this));
        Promise.onPossiblyUnhandledRejection(function (error) {
            this.logger.error("onPossiblyUnhandledRejection", error);
        }.bind(this));
    }
    getLogger(name) {
        return this.logManager.getLogger(name);
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
    start() {
        this.logger.info("Worker started");
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
}
exports.Tworker = Tworker;
//# sourceMappingURL=Tworker.js.map