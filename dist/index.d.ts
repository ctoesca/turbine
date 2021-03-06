import * as events from './lib/events';
import * as tools from './lib/tools';
import * as dao from './lib/dao';
import * as cluster from './lib/cluster';
import * as rest from './lib/rest';
import * as exceptions from './lib/exceptions';
import * as services from './lib/services';
import Promise = require('bluebird');
export { Tapplication } from './lib/Tapplication';
export { TcrudServiceBase } from './lib/TcrudServiceBase';
export { services, events, tools, dao, cluster, rest, exceptions };
export declare function _import(module: any): Promise<any>;
