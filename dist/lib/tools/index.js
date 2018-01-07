"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const portscanner = require("portscanner");
const StringPrototype = require("./String.prototype");
exports.StringPrototype = StringPrototype;
var Ttimer_1 = require("./Ttimer");
exports.Ttimer = Ttimer_1.Ttimer;
var TwindowsServiceManager_js_1 = require("./TwindowsServiceManager.js");
exports.TwindowsServiceManager = TwindowsServiceManager_js_1.TwindowsServiceManager;
function replaceEnvVars(v) {
    for (var k in process.env) {
        var value = process.env[k];
        v = v.replace("%" + k + "%", value);
        v = v.replace("${" + k + "}", value);
    }
    return v;
}
exports.replaceEnvVars = replaceEnvVars;
function getIpClient(req) {
    var ip = req.header('X-Forwarded-For');
    if (!ip)
        ip = req.connection.remoteAddress;
    if (ip == "::1")
        ip = "127.0.0.1";
    if (ip.startsWith("::ffff:"))
        ip = ip.rightOf("::ffff:");
    return ip;
}
exports.getIpClient = getIpClient;
function randomBetween(min, max) {
    return Math.floor(Math.random() * max) + min;
}
exports.randomBetween = randomBetween;
function checkPort(host, port, rejectIfNotOpened = false) {
    return new Promise(function (resolve, reject) {
        portscanner.checkPortStatus(port, host, function (error, status) {
            var isOpened = (status == "open");
            var r = {
                host: host,
                port: port,
                isOpened: isOpened
            };
            if (!isOpened && rejectIfNotOpened) {
                reject(host + ":" + port + " is not reachable");
            }
            else {
                resolve(r);
            }
        });
    }.bind(this));
}
exports.checkPort = checkPort;
function array_replace_recursive(arr, ...arrays) {
    var retObj = {}, i = 0, p = '', argl = arguments.length;
    if (argl < 2) {
        throw new Error('There should be at least 2 arguments passed to array_replace_recursive()');
    }
    for (p in arr) {
        retObj[p] = arr[p];
    }
    for (i = 1; i < argl; i++) {
        for (p in arguments[i]) {
            if (retObj[p] && typeof retObj[p] === 'object') {
                retObj[p] = this.array_replace_recursive(retObj[p], arguments[i][p]);
            }
            else {
                retObj[p] = arguments[i][p];
            }
        }
    }
    return retObj;
}
exports.array_replace_recursive = array_replace_recursive;
;
//# sourceMappingURL=index.js.map