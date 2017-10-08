import { TeventDispatcher } from './events/TeventDispatcher';
import { TdaoMysql } from './dao/TdaoMysql';
export declare class TcrudServiceBase extends TeventDispatcher {
    config: any;
    dao: TdaoMysql;
    constructor(config: any);
    getDao(): TdaoMysql;
    getById(id: any, opt: any): any;
    save(obj: any, opt: any): any;
    deleteById(id: any, opt: any): any;
    search(opt: any): any;
}
