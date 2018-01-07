/// <reference types="bluebird" />
import { TcrudServiceBase } from '../../../TcrudServiceBase';
import Promise = require("bluebird");
export declare class TserviceCommand extends TcrudServiceBase {
    constructor(config: any);
    search(opt: any): Promise<{}>;
    save(obj: any, opt: any): Promise<{}>;
}
