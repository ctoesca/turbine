"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ttimer_1 = require("../../tools/Ttimer");
const TwindowsServiceManager_1 = require("../../tools/TwindowsServiceManager");
const tools = require("../../tools");
const TbaseService_1 = require("../TbaseService");
const Promise = require("bluebird");
const child_process = require("child_process");
class TredisMonitoring extends TbaseService_1.TbaseService {
    constructor(name, config) {
        super(name, config);
        this.windowsServiceManager = new TwindowsServiceManager_1.TwindowsServiceManager();
        this.timer = new Ttimer_1.Ttimer({ delay: this.config.checkInterval * 1000 });
        this.timer.on(Ttimer_1.Ttimer.ON_TIMER, this.check.bind(this), this);
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
            "checkInterval": 60,
            "redisPath": null,
            "localNodes": [{
                    port: 6379,
                    host: '127.0.0.1'
                }]
        };
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
    extractResults(stdout) {
        var r = [];
        stdout = stdout.trim();
        var lines = stdout.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var parts = line.split(" ");
            var item = {
                host: parts[1].trim(),
                type: parts[2].trim(),
                state: parts[7].trim(),
                timestamp: parts[5].trim(),
                failed: true,
                port: null
            };
            item.failed = (item.type.toLowerCase().indexOf("fail") >= 0);
            item.port = item.host.split(":")[1];
            item.host = item.host.split(":")[0];
            if (item.type.indexOf("master"))
                item.type = "master";
            else if (item.type.indexOf("slave"))
                item.type = "slave";
            r.push(item);
        }
        return r;
    }
    processResults(nodes) {
        var failedCount = 0;
        var failedMasterCount = 0;
        var failedSlaveCount = 0;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.failed) {
                if (node.type == "master")
                    failedMasterCount++;
                else if (node.type == "slave")
                    failedSlaveCount++;
                failedCount++;
                this.onFailedNode(node);
            }
        }
        if (failedCount == 0) {
            this.logger.info("Redis Cluster: OK");
            return true;
        }
        else {
            if (failedMasterCount > 0)
                this.logger.info("failedMasterCount = " + failedMasterCount);
            if (failedSlaveCount > 0)
                this.logger.info("failedSlaveCount = " + failedSlaveCount);
            return false;
        }
    }
    getRedisServiceName(node) {
        return "Redis-" + node.port;
    }
    getRedisCliPath() {
        if (this.config.redisPath != null)
            return this.config.redisPath + "\\redis-cli";
        else
            return "redis-cli";
    }
    stopRedis(node) {
        this.logger.warn("STOPPING REDIS " + node.host + ":" + node.port + " ... ");
        return this.windowsServiceManager.stopService(this.getRedisServiceName(node));
    }
    startRedis(node) {
        return this.windowsServiceManager.startService(this.getRedisServiceName(node));
    }
    execCommand(cmd, args = null) {
        return new Promise(function (resolve, reject) {
            var stdout = "";
            var stderr = "";
            var child = child_process.exec(cmd);
            child.stdout.on('data', function (data) {
                stdout += data;
            }.bind(this));
            child.stderr.on('data', function (data) {
                stderr += data;
            }.bind(this));
            child.on('error', function (error) {
                this.logger.error(error);
                stderr += error.message;
            }.bind(this));
            child.on('exit', function (code) {
            }.bind(this));
            child.on('close', function (code) {
                if (code == null)
                    code = 0;
                resolve({ exitCode: code, stdout: stdout, stderr: stderr });
            }.bind(this));
        }.bind(this));
    }
    isLocalNode(host, port) {
        var r = false;
        for (var i = 0; i < this.config.localNodes.length; i++) {
            var node = this.config.localNodes[i];
            if ((node.host == host) && (node.port == port)) {
                r = true;
                break;
            }
        }
        return r;
    }
    onFailedNode(node) {
        if (this.isLocalNode(node.host, node.port)) {
            this.logger.error("REDIS LOCAL Node " + node.host + ":" + node.port + " (" + node.type + "): FAILED", node);
            this.stopRedis(node)
                .then(function (result) {
                this.logger.info("Service REDIS " + node.host + ":" + node.port + " arrêté");
                this.logger.info("Démarrage REDIS " + node.host + ":" + node.port);
                return this.startRedis(node);
            }.bind(this))
                .then(function (result) {
                return result;
            }.bind(this), function (err) {
                this.logger.error("Echec Start REDIS: " + err);
            }.bind(this))
                .catch(function (err) {
                this.logger.error(err.message);
            }.bind(this));
        }
        else {
            this.logger.error("REDIS Node " + node.host + ":" + node.port + " (" + node.type + "): FAILED", node);
        }
    }
    checkByNode(host, port, callback) {
        var cmd = this.getRedisCliPath() + " -h " + host + " -p " + port + " cluster nodes";
        this.execCommand(cmd)
            .then(function (result) {
            if (result.exitCode == 0) {
                var r = this.extractResults(result.stdout);
                if (!this.processResults(r))
                    this.logger.warn(result.stdout);
                if (callback)
                    callback(null, r);
            }
            else {
                this.logger.error("checkByNode.cmd = " + cmd);
                if (callback) {
                    callback(result, null);
                }
            }
        }.bind(this), function (err) {
        }.bind(this));
    }
    check() {
        var promises = [];
        var nodes = this.config.localNodes;
        for (var i = 0; i < nodes.length; i++)
            promises.push(tools.checkPort(nodes[i].host, nodes[i].port, true));
        Promise.some(promises, 2).then(function (results) {
            var index = tools.randomBetween(0, 2);
            var result = results[index];
            if (result.isOpened) {
                this.checkByNode(result.host, result.port, function (err, result) {
                    if (err)
                        this.logger.error(err);
                }.bind(this));
            }
            else {
                this.logger.error("Le node " + result.host + ":" + result.port + " ne répond pas");
            }
        }.bind(this), function (error) {
            this.logger.error("Aucun noeud REDIS local n'est accessible: démarrage de tous les noeuds...", error.toString());
            for (var i = 0; i < nodes.length; i++)
                this.startRedis(nodes[i]);
        }.bind(this));
    }
}
exports.TredisMonitoring = TredisMonitoring;
//# sourceMappingURL=TredisMonitoring.js.map