import { TeventDispatcher } from './events/TeventDispatcher';
import { TdaoMysql } from './dao/TdaoMysql';
import Promise = require("bluebird");
import Logger = require('bunyan');
export declare class TcrudServiceBase extends TeventDispatcher {
    config: any;
    dao: TdaoMysql;
    user: any;
    model: any;
    channelName: string;
    logger: Logger;
    pubSubServer: any;
    constructor(config: any);
    getDao(): Promise<TdaoMysql>;
    getById(id: any, opt: any): Promise<any>;
    save(obj: any, opt?: any): Promise<any>;
    deleteById(id: any, opt: any): Promise<any>;
    search(opt: any): Promise<{
        data: any[];
        resultCount: any;
        total: any;
        offset: any;
        limit: any;
        groupBy: any;
        orderBy: any;
    }>;
}
