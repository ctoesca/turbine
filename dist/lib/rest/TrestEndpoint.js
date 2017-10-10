"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("../events/TeventDispatcher");
const express = require("express");
class TrestEndpoint extends TeventDispatcher_1.TeventDispatcher {
    constructor(config, options) {
        super();
        this.config = null;
        this.parentApi = null;
        this.path = "/";
        this.app = null;
        this.logger = null;
        this.logger = app.getLogger(this.constructor.name);
        this.config = config;
        this.parentApi = config.parentApi;
        this.path = config.path;
        this.app = express();
        this.app.use(this.onBeforeRequest.bind(this));
        this.parentApi.use(this.path, this.app);
    }
    setXTime(res, startTime) {
        var xTime = new Date().getTime() - startTime.getTime();
        res.set('X-Time', xTime.toString());
    }
    onAfterRequest(req, res, next) {
    }
    sendResponse(req, res, next, result, status = 200) {
        res.status(status).send(result);
        this.onAfterRequest(req, res, next);
    }
    getUser(req) {
        return null;
    }
    onBeforeRequest(req, res, next) {
        req["_user"] = this.getUser(req);
        next();
    }
    init() {
    }
}
exports.TrestEndpoint = TrestEndpoint;
//# sourceMappingURL=TrestEndpoint.js.map