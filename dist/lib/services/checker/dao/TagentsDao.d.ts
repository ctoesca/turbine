/// <reference types="bluebird" />
import { TdaoMysql } from '../../../dao/TdaoMysql';
import promise = require('bluebird');
export declare class TagentsDao extends TdaoMysql {
    constructor(objectClassName: any, datasource: any, config: any);
    getByHostAndPort(host: any, port: any, status: any): promise<object>;
}
