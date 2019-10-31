import { TeventDispatcher } from '../events/TeventDispatcher';
export interface IclusterManager extends TeventDispatcher {
    nodeID: string;
    isClusterMaster: boolean;
    isServerMaster: boolean;
    keyPrefix: string;
    start(): any;
    getThisWorkerId(): string;
    onLocalClusterMessage(message: any): any;
    getNewClient(db?: any): any;
    getClient(): any;
    getRedisErrorsCount(): any;
}
