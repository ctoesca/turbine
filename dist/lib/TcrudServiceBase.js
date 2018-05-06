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
            return app.getDao(this.model.name);
        else
            return Promise.resolve(this.dao);
    }
    getById(id, opt) {
        return this.getDao()
            .then((dao) => {
            return dao.getById(id);
        });
    }
    save(obj, opt) {
        app.logger.debug("SAVE ", obj);
        return this.getDao()
            .then((dao) => {
            return dao.save(obj)
                .then((result) => {
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
            });
        });
    }
    deleteById(id, opt) {
        return this.getDao()
            .then((dao) => {
            return dao.deleteById(id, opt);
        })
            .then((result) => {
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
        });
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