import { TredisHttp } from '../redis-http/TredisHttp.js';
export declare class TredisSessions extends TredisHttp {
    constructor(name: any, server: any, config: any);
    getDefaultConfig(): {
        "active": boolean;
        "logCommands": boolean;
        "apiPath": string;
        "executionPolicy": string;
    };
}
