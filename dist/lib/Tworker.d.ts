/// <reference types="bunyan" />
import { TeventDispatcher } from './events/TeventDispatcher';
import { TlogManager } from './TlogManager';
import { TbaseService } from './services/TbaseService';
import { Tevent } from './events/Tevent';
import * as Logger from "bunyan";
export declare class Tworker extends TeventDispatcher {
    config: any;
    services: TbaseService[];
    logManager: TlogManager;
    logger: Logger;
    constructor(config: any);
    getLogger(name: string): Logger;
    onServerMasterChanged(e: Tevent): void;
    onIsMasterChanged(e: Tevent): void;
    start(): void;
    registerService(svc: TbaseService): void;
    getService(name: string): TbaseService;
}
