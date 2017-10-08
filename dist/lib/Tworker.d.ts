import { TeventDispatcher } from './events/TeventDispatcher';
import { TlogManager } from './TlogManager';
import { TbaseService } from './services/TbaseService';
import { Tevent } from './events/Tevent';
export declare class Tworker extends TeventDispatcher {
    config: any;
    services: TbaseService[];
    logManager: TlogManager;
    logger: any;
    constructor(config: any);
    getLogger(name: string): any;
    onServerMasterChanged(e: Tevent): void;
    onIsMasterChanged(e: Tevent): void;
    start(): void;
    registerService(svc: TbaseService): void;
    getService(name: string): TbaseService;
}
