/// <reference types="bluebird" />
import { TeventDispatcher } from '../../../events/TeventDispatcher';
import { Tagent } from './Tagent';
import Promise = require("bluebird");
export declare class ThttpApi extends TeventDispatcher {
    agent: Tagent;
    constructor(agent: any, config: any);
    request(opt: any): Promise<{}>;
    download(remotePath: any, localPath: any, opt: any): Promise<{}>;
    upload(localPath: any, remotePath: any, opt: any): any;
}
