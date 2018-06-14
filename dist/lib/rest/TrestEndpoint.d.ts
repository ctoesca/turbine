import { TeventDispatcher } from '../events/TeventDispatcher';
import express = require('express');
export declare class TrestEndpoint extends TeventDispatcher {
    config: any;
    parentApi: express.Application;
    path: string;
    app: express.Application;
    logger: any;
    constructor(config: any);
    setXTime(res: express.Response, startTime: Date): void;
    onAfterRequest(req: express.Request, res: express.Response, next: express.NextFunction): void;
    sendResponse(req: express.Request, res: express.Response, next: any, result: any, status?: number): void;
    getUser(req: express.Request): any;
    onBeforeRequest(req: express.Request, res: express.Response, next: express.NextFunction): void;
    init(): void;
}
