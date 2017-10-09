import { TclusterManager } from './cluster/TclusterManager';
import { IclusterManager } from './cluster/IclusterManager';
import { TbaseService } from './services/TbaseService';


import { TeventDispatcher } from './events/TeventDispatcher';
import { Tevent } from './events/Tevent';
import { TlogManager } from './TlogManager';
import * as Logger from 'bunyan';
import Promise = require('bluebird');

declare var global

export class Tapplication extends TeventDispatcher {

    appVersion: string = "1.0.0";
    config: any  = null;
    services: TbaseService[] = [];
    logManager: TlogManager;
    logger: any = null;
    ClusterManager: IclusterManager = null;

    constructor(config) {
        super();

        this.config = config;

        if (!this.config.clusterName)
            this.config.clusterName = "turbine";
    }

    init(){

      this.logManager = new TlogManager(this.config.logs);
      this.logger = this.getLogger("Application");

      Promise.onPossiblyUnhandledRejection((error) => {
        this.logger.error("onPossiblyUnhandledRejection", error);
      });

      var clusterManagerClass = TclusterManager;
      if (this.config.clusterManagerClass)
      clusterManagerClass = this.config.clusterManagerClass;


      this.ClusterManager = new clusterManagerClass(this, {
        clusterName: this.config.clusterName,
        numProcesses: this.config.numProcesses,
        redis: this.config.redis
      });

      this.ClusterManager.start();

      if (!this.ClusterManager.isMasterProcess)
      {
        this.logger.info("Node worker started (PID="+process.pid+")");
        this.ClusterManager.on("ISMASTER_CHANGED", this.onIsMasterChanged.bind(this));
        this.ClusterManager.on("MASTER_SERVER_PROCESS_CHANGED", this.onServerMasterChanged.bind(this));

        this.start();
      }else{
        this.logger.info("Node master started (PID="+process.pid+")");
      }

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

    getLogger(name: string): Logger {
        return this.logManager.getLogger(name);
    }

    start() {

    }
}
