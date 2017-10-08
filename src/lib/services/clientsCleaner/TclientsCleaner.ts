import Promise = require("bluebird");
import { TbaseService } from '../TbaseService';
import { Ttimer } from '../../tools/Ttimer';
import { Tapplication } from '../../Tapplication';

declare var app: Tapplication

export class TclientsCleaner extends TbaseService {

    timer: Ttimer;

    constructor(name, config) {
        super(name, config);

        this.timer = new Ttimer({ delay: this.config.cleanInterval * 1000 });
        this.timer.on(Ttimer.ON_TIMER, this.onTimer.bind(this), this);
    }
    getDefaultConfig() {
        return {
            "active": true,
            "executionPolicy": "one_in_cluster",
            "cleanInterval": 60,
            "clientsTimeout": 600
        };
    }
    flatify() {
        return new Promise(function (resolve, reject) {
            var r = {};
            resolve(r);
        }.bind(this));
    }
    start() {
        if (this.active) {
            this.timer.start();
            super.start();
        }
    }
    stop() {
        if (this.active)
            this.timer.stop();
        super.stop();
    }
    onTimer() {
        this.logger.debug("TclientsCleaner.onTimer");
        var now = Math.round(new Date().getTime() / 1000);
        var from = now - this.config.clientsTimeout;
        var r = app.ClusterManager.getClient().hgetall("clients", function (err, result) {
            if (err) {
                this.logger.error("TclientsCleaner", err);
            }
            else {
                for (var k in result) {
                    try {
                        var client = JSON.parse(result[k]);
                        if (client.last_use < from) {
                            this.logger.info("TclientsCleaner: Supression client " + k);
                            app.ClusterManager.getClient().hdel("clients", k);
                        }
                    }
                    catch (err) {
                        app.ClusterManager.getClient().hdel("clients", k);
                    }
                }
            }
        }.bind(this));
    }
}
