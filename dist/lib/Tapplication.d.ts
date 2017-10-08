import { TeventDispatcher } from './events/TeventDispatcher';
import { TclusterManager } from './cluster/TclusterManager';
import { TlogManager } from './TlogManager';
export declare class Tapplication extends TeventDispatcher {
    appVersion: string;
    config: any;
    services: any[];
    logManager: TlogManager;
    logger: any;
    ClusterManager: TclusterManager;
    constructor(config: any);
    getLogger(name: string): any;
    start(): void;
}
