/// <reference types="bluebird" />
import { TeventDispatcher } from '../../events/TeventDispatcher';
import { Tevent } from '../../events/Tevent';
import { Client } from './Client';
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
    constructor(channelName: string, client: Client);
    toJson(): string;
    fromJson(json: string): any;
    flatify(): Promise<{}>;
    broadcast(message: any): number;
    getQueue(): Queue;
    getClient(): Client;
    setClient(client: Client): void;
    _onClientClose(e: any): void;
    _onClientDestroy(e: Tevent): void;
    free(): void;
}
