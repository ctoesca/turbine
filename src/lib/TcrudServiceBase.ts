import { TeventDispatcher } from './events/TeventDispatcher';
import { TdaoMysql } from './dao/TdaoMysql';
import * as exceptions from './exceptions';

import Promise = require("bluebird");

declare var app

export class TcrudServiceBase extends TeventDispatcher {

    config = null
    dao:TdaoMysql = null
    user = null
    model= null

    constructor(config) {
        super();
        this.config = config;
        this.model = config.model
        app.logger.info("Creation TcrudServiceBase model.name='" + this.model.name + "'");
    }
  
    getDao(): TdaoMysql {
        if (this.dao == null)
            this.dao = app.getDao(this.model.name);
        return this.dao;
    }
    getById(id, opt) {

        app.logger.error("***** "+this.model.name+".getById("+id+")")

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
};
