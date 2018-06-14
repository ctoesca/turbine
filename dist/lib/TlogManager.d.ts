/// <reference types="node" />
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
                "type"?: undefined;
                "period"?: undefined;
                "count"?: undefined;
                "path"?: undefined;
            } | {
                "type": string;
                "period": string;
                "count": number;
                "path": string;
                "stream"?: undefined;
            })[];
        };
    };
    getLogsConfig(): any;
    getLogger(name?: string): Logger;
}
