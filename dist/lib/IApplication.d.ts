import { TeventDispatcher } from './events/TeventDispatcher';
import { TbaseService } from './services/TbaseService';
import * as Logger from 'bunyan';
export interface Iapplication extends TeventDispatcher {
    getLogger(name: string): Logger;
    start(): any;
    registerService(svc: TbaseService): void;
    getService(name: string): TbaseService;
}
