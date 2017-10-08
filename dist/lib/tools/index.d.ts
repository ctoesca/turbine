/// <reference types="express" />
import Promise = require("bluebird");
import express = require("express");
export { Ttimer } from './Ttimer';
export { TwindowsServiceManager } from "./TwindowsServiceManager.js";
export declare function replaceEnvVars(v: string): string;
export declare function getIpClient(req: express.Request): string;
export declare function randomBetween(min: number, max: number): number;
export declare function checkPort(host: string, port: number, rejectIfNotOpened?: boolean): Promise<{}>;
export declare function array_replace_recursive(arr: any): {};
