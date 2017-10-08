/// <reference types="express" />
/// <reference types="bluebird" />
import { Ttimer } from '../../tools/Ttimer';
import { Tevent } from '../../events/Tevent';
import { TbaseService } from '../TbaseService';
import { ChannelsManager } from './ChannelsManager';
import Promise = require("bluebird");
import express = require('express');
export declare class PubSubServer extends TbaseService {
    clients: any[];
    websocketServer: any;
    httpServer: any;
    app: express.Application;
    cleanClientsTimer: Ttimer;
    cleanClusterClientsTimer: Ttimer;
    _channelsManager: ChannelsManager;
    constructor(name: string, server: any, config: any);
    getDefaultConfig(): {
        "active": boolean;
        "apiPath": string;
        "prefix": string;
        "executionPolicy": string;
        "useSockjs": boolean;
        "clientCleanInterval": number;
        "clientCleanTimeout": number;
    };
    start(): void;
    stop(): void;
    onIsMasterChanged(e: Tevent): void;
    flatify(): Promise<{}>;
    getClusterConnexions(): Promise<{}>;
    onSockLog(severity: string, message: string): void;
    getChannelsManager(): ChannelsManager;
    sendChannelEvent(type: string, channelName: string, DBClient: any): void;
    onCleanClusterClientsTimer(): void;
    removeMessagesQueues(): any;
    onCleanClientsTimer(evt: Tevent): void;
    eachClient(callback: (client) => void): void;
    removeClient(client: any): number;
    getUserSession(sid: any): any;
    onConnection(conn: any, req: express.Request): void;
    onDestroyClient(e: Tevent): void;
    onCloseClient(e: Tevent): void;
    getClientsById(id: string): any[];
    getClientsByUsername(username: string): any[];
    onRedisPubSubMessage(channel: string, data: any): void;
    broadcast(messages: any, exclude?: any): void;
    sendToUsers(userNames: any, messages: any): void;
    sendMessagesToLocalUsersNames(userNames: any, messages: any): void;
    sendMessagesToLocalClients(clientsId: any, messages: any): void;
    disconnectClient(id: any): void;
    processBeforeRequest(req: any, res: any, log: any): boolean;
    initRoutes(): void;
}
