import { TeventDispatcher } from '../events/TeventDispatcher';
export interface IclusterManager extends TeventDispatcher {
    isMasterProcess: boolean;
    isClusterMaster: boolean;
    isServerMaster: boolean;
    start(): any;
    getThisWorkerId(): string;
    getClusterWorkers(): any;
    initOnWorker(): any;
    onLocalClusterMessage(message: any): any;
    getNewClient(db?: any): any;
    getClient(): any;
}
