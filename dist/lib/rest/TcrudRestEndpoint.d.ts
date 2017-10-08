/// <reference types="express" />
import { TrestEndpoint } from './TrestEndpoint';
import express = require('express');
export declare class TcrudRestEndpoint extends TrestEndpoint {
    constructor(config: any, options: any);
    getService(req: express.Request): any;
    init(): void;
    search(req: express.Request, res: express.Response, next: express.NextFunction): void;
    getById(req: express.Request, res: express.Response, next: express.NextFunction): void;
    deleteById(req: express.Request, res: express.Response, next: express.NextFunction): void;
    create(req: express.Request, res: express.Response, next: express.NextFunction): void;
    update(req: express.Request, res: express.Response, next: express.NextFunction): void;
}
