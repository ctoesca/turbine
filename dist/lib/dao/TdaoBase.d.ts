import { TeventDispatcher } from '../events/TeventDispatcher';
export declare class TdaoBase extends TeventDispatcher {
    config: any;
    logger: any;
    datasource: any;
    objectClassName: string;
    constructor(objectClassName: any, datasource: any, config: any);
}
