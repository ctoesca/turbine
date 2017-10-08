"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TbaseService_1 = require("../TbaseService");
const express = require("express");
const bodyParser = require("body-parser");
class TredisHttp extends TbaseService_1.TbaseService {
    constructor(name, server, config) {
        super(name, config);
        this.clients = {};
        this.httpServer = server;
    }
    start() {
        super.start();
        this.app = express();
        this.app.use(bodyParser.json({
            limit: '50mb'
        }));
        this.app.post('/hset', this.hset.bind(this));
        this.app.post('/hget', this.hget.bind(this));
        this.app.post('/hdel', this.hdel.bind(this));
        this.app.post('/del', this.del.bind(this));
        this.app.post('/hkeys', this.hkeys.bind(this));
        this.app.post('/hgetall', this.hgetall.bind(this));
        this.app.post('/expire', this.expire.bind(this));
        this.app.post('/keys', this.keys.bind(this));
        this.app.post('/hsearch', this.hsearch.bind(this));
        this.app.get('/check', this.check.bind(this));
        this.httpServer.use(this.config.apiPath, this.app);
    }
    getDefaultConfig() {
        return {
            "active": true,
            "logCommands": false,
            "apiPath": "/api/_plugin/redis",
            "executionPolicy": "one_per_process"
        };
    }
    check(req, res) {
        this.sendRedisResponse(null, { "status": this.name + " service : OK" }, req, res);
    }
    expire(req, res) {
        if (!this.preProcess("expire", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res) && this.verifyProperty(req.body, "value", req, res))
            this.getClient(req.body.db).expire(req.body.key, req.body.value, this.onRedisResponse.bind(this, req, res));
    }
    keys(req, res) {
        if (!this.preProcess("keys", req, res))
            return;
        if (this.verifyProperty(req.body, "pattern", req, res))
            this.getClient(req.body.db).keys(req.body.pattern, this.onRedisResponse.bind(this, req, res));
    }
    del(req, res) {
        if (!this.preProcess("del", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res))
            this.getClient(req.body.db).del(req.body.key, this.onRedisResponse.bind(this, req, res));
    }
    hset(req, res) {
        if (!this.preProcess("hset", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res) && this.verifyProperty(req.body, "field", req, res) && this.verifyProperty(req.body, "data", req, res))
            this.getClient(req.body.db).hset(req.body.key, req.body.field, req.body.data, this.onRedisResponse.bind(this, req, res));
    }
    hget(req, res) {
        if (!this.preProcess("hget", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res) && this.verifyProperty(req.body, "field", req, res))
            this.getClient(req.body.db).hget(req.body.key, req.body.field, this.onRedisResponse.bind(this, req, res));
    }
    hgetall(req, res) {
        if (!this.preProcess("hget", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res))
            this.getClient(req.body.db).hgetall(req.body.key, this.onRedisResponse.bind(this, req, res));
    }
    hsearch(req, res) {
        if (!this.preProcess("hsearch", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res)) {
            this.getClient(req.body.db).hgetall(req.body.key, function (err, result) {
                if (err) {
                    this.sendRedisResponse(err, result, req, res);
                }
                else {
                    var f = null;
                    if (req.body.filterFunction)
                        f = new Function('item', req.body.filterFunction);
                    var r = [];
                    for (var k in result) {
                        var item = JSON.parse(result[k]);
                        if (f) {
                            if (f(item))
                                r.push(item);
                        }
                        else {
                            r.push(item);
                        }
                    }
                    this.sendRedisResponse(null, r, req, res);
                }
            }.bind(this));
        }
    }
    hdel(req, res) {
        if (!this.preProcess("hdel", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res) && this.verifyProperty(req.body, "field", req, res))
            this.getClient(req.body.db).hdel(req.body.key, req.body.field, this.onRedisResponse.bind(this, req, res));
    }
    hkeys(req, res) {
        if (!this.preProcess("hkeys", req, res))
            return;
        if (this.verifyProperty(req.body, "key", req, res))
            this.getClient(req.body.db).hkeys(req.body.key, this.onRedisResponse.bind(this, req, res));
    }
    verifyProperty(data, propName, req, res) {
        var r = true;
        if (typeof data[propName] == "undefined") {
            var m = "'" + propName + "' property is missing";
            this.logger.error(m);
            res.status(400).send({ message: m });
            r = false;
        }
        return r;
    }
    onRedisResponse(req, res, err, result) {
        this.sendRedisResponse(err, result, req, res);
    }
    sendRedisResponse(err, result, req, res) {
        if (err) {
            this.logger.error("onRedisResponse err=" + err + ", result=" + result);
            res.status(500).send(err.toString());
        }
        else {
            if (this.config.logCommands)
                this.logger.info("result=", result);
            res.status(200).send({ result: result });
        }
    }
    preProcess(command, req, res) {
        if (this.config.logCommands)
            this.logger.info(command, req.body);
        if (typeof req.body.db == "undefined")
            req.body.db = 0;
        return true;
    }
    getClient(db) {
        if (typeof this.clients[db] == "undefined") {
            var client = app.ClusterManager.getNewClient();
            this.clients[db] = client;
        }
        return this.clients[db];
    }
}
exports.TredisHttp = TredisHttp;
//# sourceMappingURL=TredisHttp.js.map