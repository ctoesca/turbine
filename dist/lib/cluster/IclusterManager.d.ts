import { TeventDispatcher } from '../events/TeventDispatcher';
export interface IclusterManager extends TeventDispatcher {
    nodeID: string;
    isMasterProcess: boolean;
    isClusterMaster: boolean;
    isServerMaster: boolean;
    keyPrefix: string;
    start(): any;
    getThisWorkerId(): string;
    getClusterWorkers(): any;
    initOnWorker(): any;
    onLocalClusterMessage(message: any): any;
    getNewClient(db?: any): any;
    getClient(): any;
    getRedisErrorsCount(): any;
}
