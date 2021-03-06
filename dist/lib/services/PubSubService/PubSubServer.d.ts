/// <reference types="express" />
/// <reference types="bluebird" />
import { Ttimer } from '../../tools/Ttimer';
import { Tevent } from '../../events/Tevent';
import { TbaseService } from '../TbaseService';
import { ChannelsManager } from './ChannelsManager';
import { Client } from "./Client";
import { ThttpServer } from '../HttpServer/ThttpServer';
import express = require("express");
import Promise = require("bluebird");
export declare class PubSubServer extends TbaseService {
    clients: any[];
    websocketServer: any;
    httpServer: ThttpServer;
    app: express.Application;
    cleanClientsTimer: Ttimer;
    cleanClusterClientsTimer: Ttimer;
    _channelsManager: ChannelsManager;
    constructor(name: any, server: any, config: any);
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
    onSockLog(severity: string, message: any): void;
    getChannelsManager(): ChannelsManager;
    sendChannelEvent(type: string, channelName: string, DBClient: any): void;
    onCleanClusterClientsTimer(): void;
    removeMessagesQueues(): Promise<{}>;
    onCleanClientsTimer(evt: Tevent): void;
    eachClient(callback: any): void;
    removeClient(client: Client): number;
    getUserSession(sid: string): Promise<{}>;
    onConnection(conn: any, req: express.Request): void;
    onDestroyClient(e: Tevent): void;
    onCloseClient(e: Tevent): void;
    getClientsById(id: string): any[];
    getClientsByUsername(username: string): any[];
    onRedisPubSubMessage(channel: string, data: any): void;
    broadcast(messages: any, exclude?: any): void;
    sendToUsers(userNames: string[], messages: any): void;
    sendMessagesToLocalUsersNames(userNames: any, messages: any): void;
    sendMessagesToLocalClients(clientsId: any, messages: any): void;
    disconnectClient(id: string): void;
    processBeforeRequest(req: express.Request, res: express.Response, next: express.NextFunction): boolean;
    initRoutes(): void;
}
