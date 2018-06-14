import { Ttimer } from '../../tools/Ttimer';
import { TwindowsServiceManager } from '../../tools/TwindowsServiceManager';
import { TbaseService } from '../TbaseService';
import Promise = require("bluebird");
export declare class TredisMonitoring extends TbaseService {
    windowsServiceManager: TwindowsServiceManager;
    timer: Ttimer;
    constructor(name: any, config: any);
    flatify(): Promise<{}>;
    getDefaultConfig(): {
        "active": boolean;
        "executionPolicy": string;
        "checkInterval": number;
        "redisPath": any;
        "localNodes": {
            port: number;
            host: string;
        }[];
    };
    start(): void;
    stop(): void;
    extractResults(stdout: any): any[];
    processResults(nodes: any): boolean;
    getRedisServiceName(node: any): string;
    getRedisCliPath(): string;
    stopRedis(node: any): Promise<{}>;
    startRedis(node: any): Promise<{}>;
    execCommand(cmd: any, args?: any): Promise<{}>;
    isLocalNode(host: any, port: any): boolean;
    onFailedNode(node: any): void;
    checkByNode(host: string, port: number, callback: any): void;
    check(): void;
}
