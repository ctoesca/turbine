"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("./lib/events");
exports.events = events;
const tools = require("./lib/tools");
exports.tools = tools;
const dao = require("./lib/dao");
exports.dao = dao;
const cluster = require("./lib/cluster");
exports.cluster = cluster;
const rest = require("./lib/rest");
exports.rest = rest;
const exceptions = require("./lib/exceptions");
exports.exceptions = exceptions;
const services = require("./lib/services");
exports.services = services;
const Promise = require("bluebird");
var Tapplication_1 = require("./lib/Tapplication");
exports.Tapplication = Tapplication_1.Tapplication;
var TcrudServiceBase_1 = require("./lib/TcrudServiceBase");
exports.TcrudServiceBase = TcrudServiceBase_1.TcrudServiceBase;
function _import(module) {
    return new Promise(function (resolve, reject) {
        Promise.resolve().then(() => require(module)).then(function (clazz) {
            resolve(clazz);
        }, function (err) {
            reject(err);
        });
    });
}
exports._import = _import;
//# sourceMappingURL=index.js.map