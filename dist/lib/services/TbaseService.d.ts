import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tapplication } from '../Tapplication';
import * as Logger from "bunyan";
export declare abstract class TbaseService extends TeventDispatcher {
    name: string;
    config: any;
    started: boolean;
    active: boolean;
    executionPolicy: string;
    logger: Logger;
    application: Tapplication;
    constructor(name: string, application: Tapplication, config: any);
    abstract getDefaultConfig(): any;
    install(): void;
    uninstall(): void;
    start(): void;
    stop(): void;
}
