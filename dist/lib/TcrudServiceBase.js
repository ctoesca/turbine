"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const Promise = require("bluebird");
class TcrudServiceBase extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.config = null;
        this.dao = null;
        this.config = config;
        app.logger.info("Creation TcrudServiceBase '" + this.config.objectClass + "'");
    }
    getDao() {
        if (this.dao == null)
            this.dao = app.getDao(this.config.objectClass);
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
                        objectClass: this.config.objectClass,
                        data: result[i]
                    };
                    app.pubSubServer.broadcast({ type: 'publish', channel: "topvision.ressources." + this.config.objectClass, payload: payload });
                }
            }
            else {
                var payload = {
                    action: "post",
                    objectClass: this.config.objectClass,
                    data: result
                };
                app.pubSubServer.broadcast({ type: 'publish', channel: "topvision.ressources." + this.config.objectClass, payload: payload });
            }
            return result;
        }.bind(this));
    }
    deleteById(id, opt) {
        var dao = this.getDao();
        return dao.deleteById(id, opt).then(function (result) {
            var payload = {
                action: "delete",
                objectClass: this.config.objectClass,
                data: result,
                emetteur: {
                    clientId: opt.clientId
                }
            };
            app.pubSubServer.broadcast({ type: 'publish', channel: "topvision.ressources." + this.config.objectClass, payload: payload });
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