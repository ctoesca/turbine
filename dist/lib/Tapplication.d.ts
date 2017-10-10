/// <reference types="bunyan" />
import { IclusterManager } from './cluster/IclusterManager';
import { TbaseService } from './services/TbaseService';
import { TeventDispatcher } from './events/TeventDispatcher';
import { Tevent } from './events/Tevent';
import { TlogManager } from './TlogManager';
import * as Logger from 'bunyan';
export declare class Tapplication extends TeventDispatcher {
    appVersion: string;
    config: any;
    services: TbaseService[];
    logManager: TlogManager;
    logger: any;
    ClusterManager: IclusterManager;
    private _daoList;
    constructor(config: any);
    init(): void;
    registerService(svc: TbaseService): void;
    getService(name: string): TbaseService;
    onServerMasterChanged(e: Tevent): void;
    onIsMasterChanged(e: Tevent): void;
    getLogger(name: string): Logger;
    start(): void;
    getDao(objectClassName: any, datasourceName?: any): any;
}
