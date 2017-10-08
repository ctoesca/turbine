export declare class Tevent {
    type: string;
    data: any;
    cancelable: boolean;
    currentTarget: any;
    cancelled: boolean;
    defaultPrevented: boolean;
    bind: () => void;
    relatedData: any;
    constructor(type: string, eventData?: any, cancelable?: boolean);
    preventDefault(): void;
}
