/// <reference types="node" />
/// <reference types="bunyan" />
import * as Logger from "bunyan";
export declare class TlogManager {
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
    getLogger(name?: string): Logger;
}
