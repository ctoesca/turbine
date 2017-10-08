/// <reference types="node" />
import { TeventDispatcher } from './events/TeventDispatcher';
export declare class TlogManager extends TeventDispatcher {
    config: any;
    _loggers: {};
    logsConfig: any;
    constructor(config: any);
    getDefaultLogConfig(): {
        "logger": {
            "level": string;
            "streams": ({
                "stream": NodeJS.WriteStream;
            } | {
                "type": string;
                "period": string;
                "count": number;
                "path": string;
            })[];
        };
    };
    getLogsConfig(): any;
    getLogger(name?: string): any;
}
