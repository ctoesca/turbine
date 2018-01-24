"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const Promise = require("bluebird");
class TcrudServiceBase extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.config = null;
        this.dao = null;
        this.user = null;
        this.model = null;
        this.config = config;
        this.model = config.model;
        app.logger.debug("Creation TcrudServiceBase model.name='" + this.model.name + "'");
    }
    getDao() {
        if (this.dao == null)
            this.dao = app.getDao(this.model.name);
        return this.dao;
    }
    getById(id, opt) {
        var dao = this.getDao();
        return dao.getById(id).then(function (result) {
            return result;
        });
    }
    save(obj, opt) {
        app.logger.debug("SAVE ", obj);
        var dao = this.getDao();
        return dao.save(obj).then(function (result) {
            if (typeof result.push == "function") {
                for (var i = 0; i < obj.length; i++) {
                    var payload = {
                        action: "post",
                        objectClass: this.model.name,
                        data: result[i]
                    };
                    app.pubSubServer.broadcast({ type: 'publish', channel: "strongbox.ressources." + this.model.name, payload: payload });
                }
            }
            else {
                var payload = {
                    action: "post",
                    objectClass: this.model.name,
                    data: result
                };
                app.pubSubServer.broadcast({ type: 'publish', channel: "strongbox.ressources." + this.model.name, payload: payload });
            }
            return result;
        }.bind(this));
    }
    deleteById(id, opt) {
        var dao = this.getDao();
        return dao.deleteById(id, opt).then(function (result) {
            var payload = {
                action: "delete",
                objectClass: this.model.name,
                data: result,
                emetteur: {
                    clientId: opt.clientId
                }
            };
            app.pubSubServer.broadcast({ type: 'publish', channel: "strongbox.ressources." + this.model.name, payload: payload });
            return result;
        }.bind(this));
    }
    search(opt) {
        return new Promise(function (resolve, reject) {
            var dao = this.getDao();
            resolve(dao.search(opt));
        }.bind(this));
    }
}
exports.TcrudServiceBase = TcrudServiceBase;
;
//# sourceMappingURL=TcrudServiceBase.js.map