import { TbaseService } from '../TbaseService';
import { Ttimer } from '../../tools/Ttimer';
import { TwindowsServiceManager } from '../../tools/TwindowsServiceManager.js';
import Promise = require("bluebird");

export class TservicesAlwaysUp extends TbaseService {
      windowsServiceManager: TwindowsServiceManager;
      stoppingService: boolean = false;
      startingService: boolean = false;
      timer: Ttimer;

    constructor(name, config) {
        super(name, config);
        this.windowsServiceManager = new TwindowsServiceManager();
        this.timer = new Ttimer({ delay: this.config.interval * 1000 });
        this.timer.on(Ttimer.ON_TIMER, this.onTimer, this);
    }
    flatify() {
        return new Promise(function (resolve, reject) {
            var r = {};
            resolve(r);
        }.bind(this));
    }
    getDefaultConfig() {
        return {
            "active": true,
            "executionPolicy": "one_per_server",
            "interval": 10,
            "services": {}
        };
    }
    start() {
        if (this.active && !this.started) {
            this.timer.start();
            super.start();
        }
    }
    stop() {
        if (this.started) {
            this.timer.stop();
            super.stop();
        }
    }
    onTimer() {
        for (var serviceName in this.config.services) {
            var svc = this.config.services[serviceName];
            if (svc.action == "always-up") {
                this.checkService(serviceName)
                    .then(function (result) {
                }.bind(this))
                    .catch(function (err) {
                    this.logger.error(err.toString());
                }.bind(this));
            }
        }
    }
    checkService(name: string) {
        return this.windowsServiceManager.getServiceState(name)
            .then(function (state) {
            if (typeof state == "undefined") {
                throw new Error("service '" + name + "': state is not defined");
            }
            else {
                this.logger.debug("service '" + name + "': state=" + state);
                if (state == "STOPPED")
                    return this.windowsServiceManager.startService(name);
                else
                    return false;
            }
        }.bind(this));
    }
}
