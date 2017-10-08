import { TbaseService } from '../TbaseService';
import { Ttimer } from '../../tools/Ttimer';
import { TwindowsServiceManager } from '../../tools/TwindowsServiceManager.js';
export declare class TservicesAlwaysUp extends TbaseService {
    windowsServiceManager: TwindowsServiceManager;
    stoppingService: boolean;
    startingService: boolean;
    timer: Ttimer;
    constructor(name: any, config: any);
    flatify(): any;
    getDefaultConfig(): {
        "active": boolean;
        "executionPolicy": string;
        "interval": number;
        "services": {};
    };
    start(): void;
    stop(): void;
    onTimer(): void;
    checkService(name: string): any;
}
