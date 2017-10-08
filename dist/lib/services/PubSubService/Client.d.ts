/// <reference types="bluebird" />
import { TeventDispatcher } from '../../events/TeventDispatcher';
import Promise = require("bluebird");
export declare class Client extends TeventDispatcher {
    id: string;
    ip: string;
    DBClient: any;
    useSockjs: boolean;
    lastActivityDate: number;
    instanceId: number;
    logger: any;
    conn: any;
    server: any;
    static lastIntanceId: any;
    static logger: any;
    constructor(server: any, conn: any, opt: any);
    flatify(): Promise<{}>;
    getShortId(): any;
    getUserName(): any;
    getConnId(): any;
    sendMessage(message: any): number;
    sendMessages(messages: any): number;
    isConnected(): boolean;
    sendMessageToWebsocket(msg: any): void;
    disconnect(): void;
    onMessage(message: any, flags: any): void;
    onClose(data: any): void;
    free(): void;
    returnRpcResult(payload: any, result: any): void;
    returnRpcFailure(payload: any, errorMessage: any): void;
    getConnectedClients(args: any, success: any, failure: any): any;
    getChannelMessages(args: any, success: any, failure: any): void;
    getChannelClients(args: any, success: any, failure: any): void;
    unsubscribe(args: any, success: any, failure: any): void;
    subscribe(args: any, success: any, failure: any): void;
    touchClusterClient(): void;
    authenticate(args: any, success: any, failure: any): void;
}
