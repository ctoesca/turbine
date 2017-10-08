import { TrestEndpoint } from './TrestEndpoint';
import * as exceptions from '../exceptions';

import express = require('express');
import bodyParser = require('body-parser');
import url = require('url');

export class TcrudRestEndpoint extends TrestEndpoint {

    constructor(config, options) {
        super(config, options);
        this.app.use(bodyParser.json({
            limit: '50mb'
        }));
    }
    getService(req: express.Request) {
        var r = new this.config.serviceClass({
            objectClass: this.config.objectClass
        });
        r.user = null//connexionManager.getUserSession(req);
        if (!r.user)
            throw new exceptions.Unauthorized();
        return r;
    }
    init() {
        this.app.get("/", this.search.bind(this));
        this.app.get('/:id', this.getById.bind(this));
        this.app.delete('/:id', this.deleteById.bind(this));
        this.app.put('/:id', this.update.bind(this));
        this.app.post("/", this.create.bind(this));
    }
    search(req: express.Request, res: express.Response, next: express.NextFunction) {
        var startTime = new Date();
        var opt = {
            search: req.query.search,
            rechExacte: (req.query.rechExacte == "true") || (req.query.rechExacte == "1"),
            limit: req.query.limit,
            where: req.query.where,
            orderBy: req.query.orderBy,
            logicPipe: req.query.logicPipe,
            groupBy: req.query.groupBy,
            offset: req.query.offset,
            fields: req.query.fields,
            searchFields: req.query.searchFields
        };

        this.getService(req).search(opt).then((result) => {
            this.setXTime(res, startTime);
            this.sendResponse(req, res, next, result);
        })
        .catch(function (err) {
            next(err);
        });
    }
    getById(req: express.Request, res: express.Response, next: express.NextFunction) {
        var id = req.params.id;
        var opt = {};
        var startTime = new Date();
        this.getService(req).getById(id, opt).then(function (result) {
            this.setXTime(res, startTime);
            if (result == null)
                throw new exceptions.NotFound("L'objet '" + this.app.path() + req.path + "' n'existe pas");
            else
                this.sendResponse(req, res, next, result);
        }.bind(this)).catch(function (err) {
            next(err);
        });
    }
    deleteById(req: express.Request, res: express.Response, next: express.NextFunction) {
        var u = url.parse(req.url, true);
        var id = req.params.id;
        var opt = {
            clientId: u.query.clientId
        };
        var startTime = new Date();
        this.getService(req).deleteById(id, opt).then(function (result) {
            this.setXTime(res, startTime);
            this.sendResponse(req, res, next, result);
        }.bind(this)).catch(function (err) {
            next(err);
        });
    }
    create(req: express.Request, res: express.Response, next: express.NextFunction) {
        var u = url.parse(req.url, true);
        var id = req.params.id;
        var obj = req.body;
        var opt = {
            clientId: u.query.clientId
        };
        var startTime = new Date();
        this.getService(req).save(obj, opt).then(function (result) {
            this.setXTime(res, startTime);
            this.sendResponse(req, res, next, result);
        }.bind(this)).catch(function (err) {
            next(err);
        });
    }
    update(req: express.Request, res: express.Response, next: express.NextFunction) {
        var u = url.parse(req.url, true);
        var id = req.params.id;
        var obj = req.body;
        obj.id = id;
        var opt = {
            clientId: u.query.clientId
        };
        var startTime = new Date();
        this.getService(req).save(obj, opt).then(function (result) {
            this.sendResponse(req, res, next, result);
        }.bind(this)).catch(function (err) {
            next(err);
        });
    }
}
