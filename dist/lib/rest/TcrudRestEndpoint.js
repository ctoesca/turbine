"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TrestEndpoint_1 = require("./TrestEndpoint");
const exceptions = require("../exceptions");
const TcrudServiceBase_1 = require("../TcrudServiceBase");
const bodyParser = require("body-parser");
const url = require("url");
class TcrudRestEndpoint extends TrestEndpoint_1.TrestEndpoint {
    constructor(config) {
        super(config);
        this.model = null;
        if (!config.model)
            throw "TcrudRestEndpoint: config.model est obligatoire";
        this.model = config.model;
        this.app.use(bodyParser.json({
            limit: '50mb'
        }));
    }
    init() {
        this.app.get("/", this.search.bind(this));
        this.app.get('/:id', this.getById.bind(this));
        this.app.delete('/:id', this.deleteById.bind(this));
        this.app.put('/:id', this.update.bind(this));
        this.app.post("/", this.create.bind(this));
    }
    _createService() {
        var svc;
        if (this.config.serviceClass)
            svc = new this.config.serviceClass({ model: this.model });
        else
            svc = new TcrudServiceBase_1.TcrudServiceBase({ model: this.model });
        return svc;
    }
    getService(req) {
        var svc = this._createService();
        svc.user = req["user"];
        return Promise.resolve(svc);
    }
    callService(req, res, next, f, ...args) {
        var service;
        var startTime = new Date().getTime();
        this.getService(req)
            .then((result) => {
            service = result;
            if (typeof service[f] == "function")
                return service[f].apply(service, args);
            else
                throw "La méthode '" + f + "' n'est pas implémentée sur '" + service.constructor.name + "'";
        })
            .then((result) => {
            var xTime = new Date().getTime() - startTime;
            res.set('X-Time', xTime.toString());
            if (result == null)
                throw new exceptions.NotFound();
            res.send(result);
        })
            .catch((err) => {
            service.free();
            next(err);
        });
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
        this.callService(req, res, next, "search", opt);
    }
    getById(req, res, next) {
        var id = req.params.id;
        var opt = {};
        this.callService(req, res, next, "getById", id, opt);
    }
    deleteById(req, res, next) {
        var u = url.parse(req.url, true);
        var id = req.params.id;
        var opt = {};
        this.callService(req, res, next, "deleteById", id, opt);
    }
    create(req, res, next) {
        var u = url.parse(req.url, true);
        var obj = req.body;
        var opt = {};
        this.callService(req, res, next, "save", obj, opt);
    }
    update(req, res, next) {
        var u = url.parse(req.url, true);
        var id = req.params.id;
        var obj = req.body;
        obj.id = id;
        var opt = {};
        this.callService(req, res, next, "save", obj, opt);
    }
}
exports.TcrudRestEndpoint = TcrudRestEndpoint;
//# sourceMappingURL=TcrudRestEndpoint.js.map