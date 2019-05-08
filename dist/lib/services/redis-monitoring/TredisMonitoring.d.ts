import { Ttimer } from '../../tools/Ttimer';
import { TwindowsServiceManager } from '../../tools/TwindowsServiceManager';
import { TbaseService } from '../TbaseService';
export declare class TredisMonitoring extends TbaseService {
    windowsServiceManager: TwindowsServiceManager;
    timer: Ttimer;
    constructor(name: any, config: any);
    flatify(): any;
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
    stopRedis(node: any): any;
    startRedis(node: any): any;
    execCommand(cmd: any, args?: any): any;
    isLocalNode(host: any, port: any): boolean;
    onFailedNode(node: any): void;
    checkByNode(host: string, port: number, callback: any): void;
    check(): void;
}
