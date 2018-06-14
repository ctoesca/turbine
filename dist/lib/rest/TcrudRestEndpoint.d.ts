import { TrestEndpoint } from './TrestEndpoint';
import { TcrudServiceBase } from '../TcrudServiceBase';
import express = require('express');
export declare class TcrudRestEndpoint extends TrestEndpoint {
    model: any;
    constructor(config: any);
    init(): void;
    _createService(): TcrudServiceBase;
    getService(req: express.Request): Promise<TcrudServiceBase>;
    callService(req: any, res: any, next: any, f: any, ...args: any[]): Promise<any>;
    search(req: express.Request, res: express.Response, next: express.NextFunction): void;
    getById(req: express.Request, res: express.Response, next: express.NextFunction): void;
    deleteById(req: express.Request, res: express.Response, next: express.NextFunction): void;
    create(req: express.Request, res: express.Response, next: express.NextFunction): void;
    update(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
