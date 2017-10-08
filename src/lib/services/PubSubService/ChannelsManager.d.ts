/// <reference types="bluebird" />
import { TeventDispatcher } from '../../events/TeventDispatcher';
import Promise = require("bluebird");
import { PubSubServer } from './PubSubServer';
export declare class ChannelsManager extends TeventDispatcher {
    pubSubServer: PubSubServer;
    _channels: any;
    logger: any;
    constructor(pubSubServer: any);
    publish(messages: any): void;
    broadcast(messages: any): void;
    flatify(): Promise<{}>;
    start(): void;
    stop(): void;
    getChannelClients(channelName: string): Promise<{}>;
    getChannel(name: string, create?: boolean): any;
    createChannel(name: any): any;
    free(): void;
}
