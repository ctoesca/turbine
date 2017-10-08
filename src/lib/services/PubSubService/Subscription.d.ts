/// <reference types="bluebird" />
import { TeventDispatcher } from '../../events/TeventDispatcher';
import { Queue } from './Queue.js';
import Promise = require("bluebird");
export declare class Subscription extends TeventDispatcher {
    id: string;
    _queue: Queue;
    logger: any;
    notifySubscribeEvents: boolean;
    channelName: string;
    noClientTimeout: number;
    clientDestroyTimestamp: number;
    client: any;
    constructor(channelName: any, client: any);
    toJson(): string;
    fromJson(json: any): any;
    flatify(): Promise<{}>;
    broadcast(message: any): number;
    getQueue(): Queue;
    getClient(): any;
    setClient(client: any): void;
    _onClientClose(e: any): void;
    _onClientDestroy(e: any): void;
    free(): void;
}
