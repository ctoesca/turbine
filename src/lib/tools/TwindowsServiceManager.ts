import child_process = require("child_process");
import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tapplication } from '../Tapplication';
import Promise = require("bluebird");

declare var app: Tapplication

export class TwindowsServiceManager extends TeventDispatcher {
    logger: any;
    startingService: boolean = false;
    stoppingService: boolean = false;

    constructor(args = null) {
        super();
        this.logger = app.getLogger("TwindowsServiceManager");
    }
    getServiceState(name: string): Promise<{}> {
        return this._execCommand("sc query " + name + " | findstr STATE").then(function (result) {
            result.stdout = result.stdout.trim().replace(/\s+/g, " ");
            return result.stdout.split(" ")[3];
        }.bind(this));
    }
    _execCommand(cmd: string): Promise<{}> {
        return new Promise(function (resolve, reject) {
            var child = child_process.exec(cmd);
            child.unref();
            var r = {
                pid: child.pid,
                stdout: "",
                stderr: "",
                exitCode: -1
            };
            var pid = child.pid;
            child.stdout.on('data', function (data) {
                r.stdout += data;
            }.bind(this));
            child.stderr.on('data', function (data) {
                r.stderr += data;
            }.bind(this));
            child.on('error', function (error) {
                reject(error);
            }.bind(this));
            child.on('exit', function (code, signal) {
                r.exitCode = code;
                resolve(r);
            }.bind(this));
        }.bind(this));
    }
    startService(name: string): Promise<{}> {
        this.startingService = true;
        this.logger.warn("start service " + name + " ....");
        return this._execCommand("net start " + name)
            .then(function (result) {
            this.startingService = false;
            if (result.exitCode > 0) {
                throw new Error("startService '" + name + "': " + result.stdout + " " + result.stderr);
            }
            else {
                this.logger.info("Service " + name + " démarré");
                return result;
            }
        }.bind(this))
            .catch(function (err) {
            this.startingService = false;
            throw new Error(err.toString());
        }.bind(this));
    }
    stopService(name: string): Promise<{}> {
        this.stoppingService = true;
        this.logger.warn("stop service " + name + " ....");
        return this._execCommand("net stop " + name)
            .then(function (result) {
            this.stoppingService = false;
            if (result.exitCode > 0) {
                throw new Error("stopService '" + name + "': " + result.stdout + " " + result.stderr);
            }
            else {
                this.logger.info("Service " + name + " arrêté");
                return result;
            }
        }.bind(this))
            .catch(function (err) {
            this.stoppingService = false;
            throw new Error(err.toString());
        }.bind(this));
    }
}
