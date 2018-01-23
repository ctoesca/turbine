/// <reference types="bunyan" />
import { IclusterManager } from './cluster/IclusterManager';
import { TbaseService } from './services/TbaseService';
import { ThttpServer } from "./services/HttpServer/ThttpServer";
import { TeventDispatcher } from './events/TeventDispatcher';
import { Tevent } from './events/Tevent';
import { TlogManager } from './TlogManager';
import * as Logger from 'bunyan';
export declare class Tapplication extends TeventDispatcher {
    appVersion: string;
    config: any;
    services: TbaseService[];
    models: {};
    logManager: TlogManager;
    logger: any;
    ClusterManager: IclusterManager;
    httpServer: ThttpServer;
    private _daoList;
    constructor(config: any);
    init(): void;
    registerService(svc: TbaseService): void;
    getService(name: string): TbaseService;
    onServerMasterChanged(e: Tevent): void;
    onIsMasterChanged(e: Tevent): void;
    getLogger(name: string): Logger;
    start(): void;
    registerModel(model: any): void;
    getDao(objectClassName: any, datasourceName?: any): any;
}
