import { TeventDispatcher } from '../events/TeventDispatcher';
export declare class Ttimer extends TeventDispatcher {
    delay: number;
    running: boolean;
    count: number;
    intervalID: any;
    static ON_TIMER: string;
    constructor(args?: any);
    start(): void;
    reset(): void;
    stop(): void;
    _onTimer(token: any): void;
}
