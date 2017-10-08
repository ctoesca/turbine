/// <reference types="express" />
import { TbaseService } from '../TbaseService.js';
import express = require('express');
export declare class ThttpServer extends TbaseService {
    app: express.Application;
    server: any;
    constructor(name: any, config: any);
    setupSessions(): void;
    start(): void;
    setErrorsHandlers(): void;
    listen(): void;
    use(path: any, app: any): void;
    createServer(): any;
    ipIsAllowed(ip: any): boolean;
    authRequest(req: express.Request, res: express.Response, next: express.NextFunction): void;
    getDefaultConfig(): {
        "executionPolicy": string;
        "http-access-log": {
            "enabled": boolean;
            "rotating-period": string;
            "log-name": string;
            "log-dir": string;
        };
        bindAddress: string;
        port: number;
        https: {
            "enabled": boolean;
            "pathOpenSSL": any;
            "days": number;
            "selfSigned": boolean;
        };
        requestTimeout: number;
        allowedIp: string;
        auth: any;
        "static": {
            "options": {
                "lastModified": boolean;
                "maxAge": string;
            };
            "virtualDirectories": {
                "url": string;
                "path": string;
            }[];
        };
    };
    initRoutes(): void;
}
