import { TeventDispatcher } from './events/TeventDispatcher';
import { TclusterManager } from './cluster/TclusterManager';
import { TlogManager } from './TlogManager';

declare var global

export class Tapplication extends TeventDispatcher {
    appVersion: string = "1.0.0";
    config: any  = null;
    services: any[] = [];
    logManager: TlogManager;
    logger: any = null;
    ClusterManager: TclusterManager = null;

    constructor(config) {
        super();

        this.config = config;
        if (!this.config.clusterName)
            this.config.clusterName = "turbine";
        this.logManager = new TlogManager(this.config.logs);
        this.logger = this.getLogger("Application");
        global.logger = this.getLogger("main");
        global.getLogger = this.getLogger.bind(this);
        var clusterManagerClass = TclusterManager;
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
    getLogger(name: string) {
        return this.logManager.getLogger(name);
    }
    start() {
        this.logger.info("Application started");
    }
}
