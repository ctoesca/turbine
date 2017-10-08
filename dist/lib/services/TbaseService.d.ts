import { TeventDispatcher } from '../events/TeventDispatcher';
export declare abstract class TbaseService extends TeventDispatcher {
    name: string;
    config: any;
    started: boolean;
    active: boolean;
    executionPolicy: string;
    logger: any;
    constructor(name: any, config: any);
    abstract getDefaultConfig(): any;
    start(): void;
    stop(): void;
}