"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TrestEndpoint_1 = require("./TrestEndpoint");
const exceptions = require("../exceptions");
const bodyParser = require("body-parser");
const url = require("url");
class TcrudRestEndpoint extends TrestEndpoint_1.TrestEndpoint {
    constructor(config, options) {
        super(config, options);
        this.app.use(bodyParser.json({
            limit: '50mb'
        }));
    }
    getService(req) {
        var r = new this.config.serviceClass({
            objectClass: this.config.objectClass
        });
        r.user = null;
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
    search(req, res, next) {
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
    getById(req, res, next) {
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
    deleteById(req, res, next) {
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
    create(req, res, next) {
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
    update(req, res, next) {
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
exports.TcrudRestEndpoint = TcrudRestEndpoint;
//# sourceMappingURL=TcrudRestEndpoint.js.map