/// <reference types="bluebird" />
import { TeventDispatcher } from '../../events/TeventDispatcher';
import { Subscription } from './Subscription';
import Promise = require("bluebird");
export declare class Queue extends TeventDispatcher {
    subscription: Subscription;
    messages: any[];
    logger: any;
    constructor(subscription: any);
    getKey(): string;
    addMessage(message: any): void;
    consume(): any[];
    getMessages(): Promise<{}>;
    getSize(): Promise<{}>;
    free(): void;
    clear(): void;
}
