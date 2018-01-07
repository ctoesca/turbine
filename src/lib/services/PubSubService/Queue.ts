import { TeventDispatcher } from '../../events/TeventDispatcher';
import { Tevent } from '../../events/Tevent';
import { Subscription } from './Subscription';
import { Tapplication } from '../../Tapplication';
import Promise = require("bluebird");

declare var app: Tapplication

export class Queue extends TeventDispatcher {

    subscription: Subscription;
    messages: any[] = [];
    logger: any;

    constructor(subscription) {
        super();
        this.subscription = subscription;
        this.logger = app.getLogger("Queue");
    }

    getKey() {
        return this.subscription.id + "_messages_queue";
    }
    addMessage(message) {
        app.ClusterManager.getClient().rpush(this.getKey(), JSON.stringify(message));
        this.messages.push(message);
        this.dispatchEvent(new Tevent("MESSAGE_ADDED", message));
    }
    consume() {
        var r = this.messages;
        this.messages = [];
        app.ClusterManager.getClient().del(this.getKey());
        return r;
    }
    getMessages(): Promise<{}> {
        return new Promise(function (resolve, reject) {
            app.ClusterManager.getClient().lrange(this.getKey(), 0 - 1, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    var r = [];
                    for (var i = 0; i < result.length; i++)
                        r.push(JSON.parse(result[i]));
                    resolve(r);
                }
            }.bind(this));
        }.bind(this));
    }
    getSize(): Promise<{}> {
        return new Promise(function (resolve, reject) {
            app.ClusterManager.getClient().llen(this.getKey(), function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            }.bind(this));
        }.bind(this));
    }
    free() {
        super.free();
        this.clear();
        this.messages = null;
    }
    clear() {
        this.messages = [];
        app.ClusterManager.getClient().del(this.getKey());
    }
}
