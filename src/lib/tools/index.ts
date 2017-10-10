import Promise = require("bluebird");
import express = require("express");
import portscanner = require('portscanner');
const StringPrototype = require('./String.prototype');


export { Ttimer } from './Ttimer';
export { TwindowsServiceManager } from "./TwindowsServiceManager.js";

export function replaceEnvVars(v: string): string{
  for (var k in process.env) {
      var value = process.env[k];
      v = v.replace("%" + k + "%", value);
      v = v.replace("${" + k + "}", value);
  }
  return v;
}
export function getIpClient(req: express.Request): string{
  var ip = req.header('X-Forwarded-For');
  if (!ip)
      ip = req.connection.remoteAddress;
  if (ip == "::1")
      ip = "127.0.0.1";

  if (ip.startsWith("::ffff:"))
      ip = ip.rightOf("::ffff:");
  return ip;
}
export function randomBetween(min: number, max: number): number{
    return Math.floor(Math.random() * max) + min;
}

export function checkPort(host: string, port: number, rejectIfNotOpened: boolean = false): Promise<{}>{
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

export function array_replace_recursive(arr: any) {
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
};
