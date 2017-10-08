import { Tevent } from './Tevent';

export class TeventDispatcher {

    protected _listeners: {} = {};
    protected _isDestroyed: boolean = false;

    constructor(args = null) {
    }

    free() {
        var evt = new Tevent("DESTROY");
        this.dispatchEvent(evt);
        this.removeAllListeners();
        this._isDestroyed = true;
    }
    _getListenerIndex(type: string, listener: (evt: Tevent) => void): number {
        if (!this.hasEventListener(type))
            return -1;
        for (var i = 0; i < this._listeners[type].length; i++) {
            if (this._listeners[type][i] != null)
                if (this._listeners[type][i].listener == listener)
                    return i;
        }
        return -1;
    }
    dispatchEvent(event: Tevent): void {
        if (!this.hasEventListener(event.type))
            return;
        var listeners = this._listeners[event.type];
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i] != null) {
                var list = listeners[i];
                if (event.currentTarget == null)
                    event.currentTarget = this;
                event.bind = list.bind;
                event.relatedData = list.data;
                if (!list.listener) {
                    var m = {
                        message: "!!!!!!!! listener function =" + list.listener + " . ERREUR TeventDispatcher.dispatchEvent(" + event.type + "), _isDestroyed=" + this._isDestroyed,
                        list: list
                    };
                    throw m;
                }
                else {
                    if (event.bind == null)
                        list.listener.call(this, event);
                    else
                        list.listener.call(event.bind, event);
                }
                if (event.cancelled)
                    break;
            }
        }
    }
    on(type: string, listener: (evt: Tevent) => void, bind = null, data = null) {
        if (arguments.length < 4)
            var data = null;
        if (arguments.length < 3)
            var bind = null;
        var l = { "listener": listener, "data": data, "bind": bind };
        if (!this.hasEventListener(type))
            this._listeners[type] = [];
        for (var i = 0; i < this._listeners[type].length; i++) {
            if (this._listeners[type][i] == null) {
                this._listeners[type][i] = l;
                return;
            }
        }
        this._listeners[type].push(l);
    }
    offByCtx(ctx) {
        for (var type in this._listeners) {
            var listeners = this._listeners[type];
            for (var i = 0; i < listeners.length; i++) {
                if ((listeners[i] != null) && (listeners[i].bind == ctx)) {
                    listeners[i] = null;
                }
            }
        }
    }
    off(type: string, listener: (evt: Tevent) => void) {
        var indx = this._getListenerIndex(type, listener);
        if (indx >= 0) {
            this._listeners[type][indx] = null;
        }
    }
    removeAllListeners() {
        for (var type in this._listeners) {
            this._listeners[type].length = 0;
            this._listeners[type] = null;
            delete this._listeners[type];
        }
    }
    hasEventListener(evtType: string) {
        return (typeof this._listeners[evtType] != "undefined");
    }
}
