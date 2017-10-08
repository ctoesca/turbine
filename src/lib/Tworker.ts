import { TeventDispatcher } from './events/TeventDispatcher';
import { TlogManager } from './TlogManager';
import { TbaseService } from './services/TbaseService';
import { Tevent } from './events/Tevent';
import Promise = require("bluebird");

declare var global
declare var app

export class Tworker extends TeventDispatcher {
    config: any;
    services: TbaseService[] = [];
    logManager: TlogManager;
    logger: any;
    constructor(config) {
        super();

        this.config = config
        this.logManager = new TlogManager(this.config.logs);
        this.logger = this.getLogger("Tworker");
        global.logger = this.getLogger("main");
        global.getLogger = this.getLogger.bind(this);
        app.ClusterManager.on("ISMASTER_CHANGED", this.onIsMasterChanged.bind(this));
        app.ClusterManager.on("MASTER_SERVER_PROCESS_CHANGED", this.onServerMasterChanged.bind(this));
        Promise.onPossiblyUnhandledRejection(function (error) {
            this.logger.error("onPossiblyUnhandledRejection", error);
        }.bind(this));
    }
    getLogger(name: string): any {
        return this.logManager.getLogger(name);
    }
    onServerMasterChanged(e: Tevent): void {
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

    onIsMasterChanged(e: Tevent): void {
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
    start(): void {
        this.logger.info("Worker started");
    }
    registerService(svc: TbaseService): void {
        this.services.push(svc);
        if (svc.active && (svc.executionPolicy == "one_per_process"))
            svc.start();
        else
            svc.stop();
    }
    getService(name: string):TbaseService {
        var r: TbaseService = null;
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
