import { TbaseService } from '../TbaseService';
import { ThttpServer } from '../HttpServer/ThttpServer';
import express = require('express');
export declare class TredisHttp extends TbaseService {
    clients: any;
    httpServer: ThttpServer;
    app: express.Application;
    constructor(name: any, server: any, config: any);
    start(): void;
    getDefaultConfig(): {
        "active": boolean;
        "logCommands": boolean;
        "apiPath": string;
        "executionPolicy": string;
    };
    check(req: express.Request, res: express.Response): void;
    expire(req: express.Request, res: express.Response): void;
    keys(req: express.Request, res: express.Response): void;
    del(req: express.Request, res: express.Response): void;
    hset(req: express.Request, res: express.Response): void;
    hget(req: express.Request, res: express.Response): void;
    hgetall(req: express.Request, res: express.Response): void;
    hsearch(req: express.Request, res: express.Response): void;
    hdel(req: express.Request, res: express.Response): void;
    hkeys(req: express.Request, res: express.Response): void;
    verifyProperty(data: any, propName: string, req: express.Request, res: express.Response): boolean;
    onRedisResponse(req: express.Request, res: express.Response, err: any, result: any): void;
    sendRedisResponse(err: any, result: any, req: express.Request, res: express.Response): void;
    preProcess(command: any, req: express.Request, res: express.Response): boolean;
    getClient(db: any): any;
}
