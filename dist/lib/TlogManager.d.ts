/// <reference types="node" />
import * as Logger from "bunyan";
export declare class TlogManager {
    config: any;
    _loggers: Map<string, Logger>;
    logsConfig: any;
    rotator: any;
    rotatorFile: string;
    rotatorParams: any;
    constructor(config: any);
    onServerMasterChanged(data: any): void;
    enableLogRotator(data: any): void;
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
    getLogger(name?: string, loggerConf?: any): Logger;
}
