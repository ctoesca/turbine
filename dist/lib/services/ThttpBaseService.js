"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TbaseService_1 = require("./TbaseService");
const express = require("express");
class ThttpBaseService extends TbaseService_1.TbaseService {
    constructor(name, application, config) {
        super(name, application, config);
        this.httpServer = application.getHttpServer();
        this.app = express();
    }
    start() {
        super.start();
    }
    stop() {
        super.stop();
    }
}
exports.ThttpBaseService = ThttpBaseService;
//# sourceMappingURL=ThttpBaseService.js.map