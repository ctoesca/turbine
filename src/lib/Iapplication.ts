import { TeventDispatcher } from './events/TeventDispatcher';
import { Tevent } from './events/Tevent';
import { TbaseService } from './services/TbaseService';
import { TclusterManager } from './cluster/TclusterManager';
import { TlogManager } from './TlogManager';
import * as Logger from 'bunyan';

export interface Iapplication extends TeventDispatcher {

    getLogger(name: string): Logger

    start()

    registerService(svc: TbaseService): void

    getService(name: string):TbaseService


}
