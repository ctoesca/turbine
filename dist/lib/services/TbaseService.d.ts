import { TeventDispatcher } from '../events/TeventDispatcher';
import * as Logger from "bunyan";
export declare abstract class TbaseService extends TeventDispatcher {
    name: string;
    config: any;
    started: boolean;
    active: boolean;
    executionPolicy: string;
    logger: Logger;
    constructor(name: any, config: any);
    abstract getDefaultConfig(): any;
    install(): void;
    uninstall(): void;
    start(): void;
    stop(): void;
}
