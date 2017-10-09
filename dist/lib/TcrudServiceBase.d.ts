/// <reference types="bluebird" />
import { TeventDispatcher } from './events/TeventDispatcher';
import { TdaoMysql } from './dao/TdaoMysql';
import Promise = require("bluebird");
export declare class TcrudServiceBase extends TeventDispatcher {
    config: any;
    dao: TdaoMysql;
    constructor(config: any);
    getDao(): TdaoMysql;
    getById(id: any, opt: any): Promise<any>;
    save(obj: any, opt: any): Promise<{}>;
    deleteById(id: any, opt: any): Promise<{}>;
    search(opt: any): Promise<{}>;
}
