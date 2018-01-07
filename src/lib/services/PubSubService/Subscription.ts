import { TeventDispatcher } from '../../events/TeventDispatcher';
import { Tevent } from '../../events/Tevent';
import { Client } from './Client';
import { Queue } from './Queue.js';
import Promise = require("bluebird");
import { Tapplication } from '../../Tapplication';

declare var app: Tapplication

export class Subscription extends TeventDispatcher {
    id: string;
    _queue: Queue;
    logger: any;
    notifySubscribeEvents: boolean = false;
    channelName: string = null;
    noClientTimeout: number = 120000;
    clientDestroyTimestamp: number = null;
    client: any;

    constructor(channelName: string, client: Client) {
        super();

        this.setClient(client);
        this.channelName = channelName;
        this.id = this.channelName + "_" + this.client.id;
        this._queue = new Queue(this);
        this.logger = app.getLogger("Subscription");
    }
    toJson() {
        var r = {
            clientId: null
        };
        if (this.client)
            r.clientId = this.client.id;
        return JSON.stringify(r);
    }
    fromJson(json: string) {
        return JSON.parse(json);
    }
    flatify(): Promise<{}> {
        return new Promise(function (resolve, reject) {
            var r = {
                client: {
                    id: this.client.id,
                    connId: this.client.connId,
                    userName: null
                }
            };
            if (this.client.DBClient)
                r.client.userName = this.client.DBClient.userName;
            resolve(r);
        }.bind(this));
    }
    broadcast(message) {
        if (!this.notifySubscribeEvents && (message.type == "channel_event"))
            return;
        var count = 0;
        if (this.client && this.client.isConnected()) {
            count += this.client.sendMessage(message);
        }
        else {
            if (this.logger)
                this.logger.info(this.channelName + " envoi message à un client non connecté. Ajout dans le tampon (cid=" + this.client.id + ")");
            this._queue.addMessage(message);
        }
        return count;
    }
    getQueue(): Queue {
        return this._queue;
    }
    getClient(): Client {
        return this.client;
    }
    setClient(client: Client) {
        if (this.client != null) {
            this.logger.trace("Subscription.setClient: détachement client " + this.client.instanceId);
            this.client.offByCtx(this);
        }
        this.client = client;
        this.clientDestroyTimestamp = null;
        this.client.on("DESTROY", this._onClientDestroy, this);
        this.client.on("CLOSE", this._onClientClose, this);
    }
    _onClientClose(e) {
    }
    _onClientDestroy(e: Tevent) {
        if (this.client)
            this.client.offByCtx(this);
        this.clientDestroyTimestamp = new Date().getTime();
        setTimeout(function () {
            if (this.clientDestroyTimestamp != null) {
                var diff = new Date().getTime() - this.clientDestroyTimestamp;
                if (diff >= this.noClientTimeout)
                    this.free();
            }
        }.bind(this), this.noClientTimeout);
    }
    free() {
        if (this.client)
            this.logger.info("Subscription.free: client=" + this.client.id);
        else
            this.logger.info("Subscription.free: client=null");
        super.free();
        if (this.client)
            this.client.offByCtx(this);
        this.client = null;
        this.logger = null;
        this._queue.free();
        this._queue = null;
    }
}
