/// <reference types="node" />
import { TeventDispatcher } from '../events/TeventDispatcher';
import { Ttimer } from '../tools/Ttimer';
import cluster = require("cluster");
export declare class TclusterManager extends TeventDispatcher {
    config: any;
    redisErrors: number;
    app: any;
    workers: object;
    keyPrefix: string;
    workerInfos: any;
    logger: any;
    localMasterPid: number;
    client: any;
    timerInterval: number;
    maxActivityInterval: number;
    nodeID: any;
    oneProcessPerServerTimer: Ttimer;
    constructor(app: any, config: any);
    readonly isClusterMaster: any;
    readonly isServerMaster: any;
    onPossiblyUnhandledRejection(error: any): void;
    start(): void;
    onTimer(): void;
    getThisWorkerId(): string;
    getClusterWorkers(): {
        [index: string]: cluster.Worker;
    };
    saveWorker(w: any, callback: any, error: any): void;
    initOnWorker(): void;
    onLocalClusterMessage(message: any): void;
    getNewClient(db?: any): any;
    getClient(): any;
}
