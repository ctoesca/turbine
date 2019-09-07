import { TeventDispatcher } from '../events/TeventDispatcher';
import express = require('express');
import Logger = require('bunyan');
export declare class TrestEndpoint extends TeventDispatcher {
    protected config: any;
    protected parentApi: express.Application;
    protected path: string;
    protected app: express.Application;
    protected logger: Logger;
    constructor(config: any);
    setXTime(res: express.Response, startTime: Date): void;
    onAfterRequest(req: express.Request, res: express.Response, next: express.NextFunction): void;
    sendResponse(req: express.Request, res: express.Response, next: any, result: any, status?: number): void;
    getUser(req: express.Request): any;
    onBeforeRequest(req: express.Request, res: express.Response, next: express.NextFunction): void;
    init(): void;
}
