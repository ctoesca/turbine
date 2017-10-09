import { Tevent } from './Tevent';
export declare class TeventDispatcher {
    private _listeners;
    private _isDestroyed;
    constructor(args?: any);
    free(): void;
    _getListenerIndex(type: string, listener: (evt: Tevent) => void): number;
    dispatchEvent(event: Tevent): void;
    on(type: string, listener: (evt: Tevent) => void, bind?: any, data?: any): void;
    offByCtx(ctx: any): void;
    off(type: string, listener: (evt: Tevent) => void): void;
    removeAllListeners(): void;
    hasEventListener(evtType: string): boolean;
}
