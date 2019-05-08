import { TeventDispatcher } from './events/TeventDispatcher';
import { TdaoMysql } from './dao/TdaoMysql';
import Promise = require("bluebird");
export declare class TcrudServiceBase extends TeventDispatcher {
    config: any;
    dao: TdaoMysql;
    user: any;
    model: any;
    channelName: string;
    constructor(config: any);
    getDao(): Promise<TdaoMysql>;
    getById(id: any, opt: any): any;
    save(obj: any, opt?: any): any;
    deleteById(id: any, opt: any): any;
    search(opt: any): any;
}
