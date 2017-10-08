import { TeventDispatcher } from '../events/TeventDispatcher';
import Promise = require("bluebird");
export declare class TwindowsServiceManager extends TeventDispatcher {
    logger: any;
    startingService: boolean;
    stoppingService: boolean;
    constructor(args?: any);
    getServiceState(name: string): Promise<{}>;
    _execCommand(cmd: string): Promise<{}>;
    startService(name: string): Promise<{}>;
    stopService(name: string): Promise<{}>;
}
