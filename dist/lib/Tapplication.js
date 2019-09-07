"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TclusterManager_1 = require("./cluster/TclusterManager");
const TcrudRestEndpoint_1 = require("./rest/TcrudRestEndpoint");
const TcrudServiceBase_1 = require("./TcrudServiceBase");
const TdaoMysql_1 = require("./dao/TdaoMysql");
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const TlogManager_1 = require("./TlogManager");
const Promise = require("bluebird");
const fs = require("fs-extra");
const tools = require("./tools");
class Tapplication extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.appVersion = {
            "name": "1.0.0",
            "needReload": false
        };
        this.config = null;
        this.services = new Map();
        this.models = {};
        this.logger = null;
        this.ClusterManager = null;
        this.sessionName = null;
        this.servicesClasses = new Map();
        this._daoList = {};
        this.config = config;
        if (!this.config.tmpDir) {
            this.config.tmpDir = __dirname + '/../tmp';
        }
        else {
            this.config.tmpDir = tools.replaceEnvVars(this.config.tmpDir);
        }
        try {
            fs.ensureDirSync(this.config.tmpDir);
        }
        catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }
        this.sessionName = config.services.httpServer.session.options.name;
        this.logManager = new TlogManager_1.TlogManager(this.config.logs);
        if (!this.config.clusterName)
            this.config.clusterName = "turbine";
        process.on('SIGINT', () => {
            this.onStop('SIGINT');
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            this.onStop('SIGTERM');
            process.exit(0);
        });
    }
    onStop(signal) {
        this.logger.info("SIGTERM processus. Arrêt des services.");
        this.services.forEach((service, k) => {
            service.stop();
        });
        this.logger.info("Services arrêtés.");
    }
    getTmpDir() {
        return this.config.tmpDir;
    }
    getDataDir() {
        return __dirname + "/..";
    }
    init() {
        this.logger = this.getLogger("Application");
        this.logger.info("************* INIT APPLICATION *************");
        if (this.httpServer != null)
            throw new Error("Tapplication.init() ne peut être appelé qu'une seule fois.");
        Promise.onPossiblyUnhandledRejection((error) => {
            this.logger.error("onPossiblyUnhandledRejection", error);
        });
        var clusterManagerClass = TclusterManager_1.TclusterManager;
        if (this.config.clusterManagerClass)
            clusterManagerClass = this.config.clusterManagerClass;
        this.ClusterManager = new clusterManagerClass(this, {
            clusterName: this.config.clusterName,
            numProcesses: this.config.numProcesses,
            redis: this.config.redis
        });
        this.ClusterManager.start();
        if (!this.ClusterManager.isMasterProcess) {
            this.logger.info("Node worker started (PID=" + process.pid + ")");
            this.ClusterManager.on("ISMASTER_CHANGED", this.onIsMasterChanged.bind(this));
            this.ClusterManager.on("MASTER_SERVER_PROCESS_CHANGED", this.onServerMasterChanged.bind(this));
            let httpServerClass = require('./services/httpServer/Tservice').Tservice;
            this.httpServer = new httpServerClass("httpServer", this, this.config.services.httpServer);
            this.registerService(this.httpServer);
            return this.registerModelFromFile(this.config.defaultModelsPath + "/models")
                .then(() => {
                return this.createServices(__dirname + '/services');
            });
        }
        else {
            this.logger.info("Node master started (PID=" + process.pid + ")");
            return Promise.resolve();
        }
    }
    getCookies(req) {
        var cookies = {};
        if (req.headers.cookie) {
            var cookieHeader = req.headers.cookie;
            cookieHeader.split(';').forEach(function (cookie) {
                var parts = cookie.split('=');
                cookies[parts.shift().trim()] = decodeURI(parts[0]);
            });
        }
        return cookies;
    }
    getUserSession(req) {
        var r = null;
        var cookies = this.getCookies(req);
        if (cookies[this.sessionName]) {
            return this.ClusterManager.getClient().hget("session." + this.sessionName, cookies[this.sessionName])
                .then(function (session) {
                if (session)
                    return JSON.parse(session);
                else
                    return null;
            })
                .catch(function (err) {
                this.logger.error("getUserSession", err);
                throw err;
            }.bind(this));
        }
        else {
            return Promise.resolve(null);
        }
    }
    registerService(svc) {
        this.services.set(svc.name, svc);
    }
    getService(name) {
        var r = null;
        if (this.services.has(name)) {
            r = this.services.get(name);
        }
        return r;
    }
    onServerMasterChanged(e) {
        this.logManager.onServerMasterChanged(e.data);
        if (e.data) {
            this.logger.info("This worker becomes SERVER_MASTER");
        }
        else {
            this.logger.info("This worker is no longer SERVER_MASTER");
        }
        this.services.forEach((svc, k) => {
            if (svc.active && (svc.executionPolicy == "one_per_server")) {
                if (e.data)
                    svc.start();
                else
                    svc.stop();
            }
        });
    }
    onIsMasterChanged(e) {
        if (e.data)
            this.logger.info("This worker becomes MASTER");
        else
            this.logger.info("This worker is no longer MASTER");
        this.services.forEach((svc, k) => {
            if (svc.executionPolicy == "one_in_cluster") {
                if (e.data)
                    svc.start();
                else
                    svc.stop();
            }
        });
    }
    getLogger(name) {
        return this.logManager.getLogger(name);
    }
    start() {
        if (!this.ClusterManager.isMasterProcess) {
            this.services.forEach((svc, k) => {
                if (svc.active && (svc.executionPolicy == "one_per_process") && (!this.ClusterManager.isMasterProcess))
                    svc.start();
            });
        }
        return Promise.resolve();
    }
    getHttpServer() {
        return this.httpServer;
    }
    createServices(path) {
        let r = [];
        for (let name in this.config.services) {
            if (this.getService(name) === null) {
                let serviceConfig = this.config.services[name];
                if (this.canCreateService(name) === true) {
                    let svcPath = path + '/' + name + "/Tservice.js";
                    if (fs.existsSync(svcPath)) {
                        let svcClass = require(svcPath).Tservice;
                        this.servicesClasses.set(name, svcClass);
                        let serviceInstance = new svcClass(name, this, serviceConfig);
                        this.registerService(serviceInstance);
                        r.push(serviceInstance);
                    }
                }
            }
        }
        return Promise.resolve(r);
    }
    canCreateService(name) {
        return (typeof this.config.services[name] != "undefined") && (this.config.services[name].active === true);
    }
    registerModel(name, model, app = null) {
        if (typeof this.models[name] != "undefined")
            this.logger.warn("registerModelConfig: le model '" + name + "' a déjà été enregistré. Il va être écrasé.");
        this.models[name] = model;
        model.name = name;
        if (model.entryPoint) {
            var endpointClass = TcrudRestEndpoint_1.TcrudRestEndpoint;
            if (typeof model.entryPoint.class != "undefined")
                endpointClass = model.entryPoint.class;
            var serviceClass = TcrudServiceBase_1.TcrudServiceBase;
            if (typeof model.entryPoint.serviceClass != "undefined")
                serviceClass = model.entryPoint.serviceClass;
            if (app == null)
                app = this.httpServer.app;
            if (model.entryPoint.path) {
                var endpoint = new endpointClass({
                    parentApi: app,
                    path: model.entryPoint.path,
                    model: model,
                    serviceClass: serviceClass
                });
                endpoint.init();
                this.logger.info("Register endpoint '" + model.entryPoint.path + "' for model " + name + " => SUCCESS");
            }
        }
        this.logger.info("Register model '" + name + "' => SUCCESS");
        return this.models[name];
    }
    registerModelFromFile(path) {
        return new Promise((resolve, reject) => {
            Promise.resolve().then(() => require(path)).then((conf) => {
                for (let modelName in conf)
                    this.registerModel(modelName, conf[modelName]);
                resolve();
            });
        });
    }
    getDao(objectClassName, datasourceName = null) {
        var id = objectClassName + "." + datasourceName;
        if (!this._daoList[id]) {
            let modelConfig;
            if (!this.models)
                throw new Error("l'objet 'models' n'existe pas dans la configuration");
            else if (!this.models[objectClassName])
                throw new Error("Le model " + objectClassName + " n'est pas référencée");
            else
                modelConfig = this.models[objectClassName];
            if (!modelConfig.dao)
                throw new Error("Le model '" + objectClassName + "' n'a pas de dao défini");
            var daoConfig = null;
            if (modelConfig.dao.config)
                daoConfig = modelConfig.dao.config;
            else
                throw new Error("Le DAO du model '" + objectClassName + "' n'a pas de configuration définie");
            daoConfig.model = modelConfig;
            if (datasourceName == null) {
                if (daoConfig.datasource)
                    datasourceName = daoConfig.datasource;
                else
                    throw new Error("Le dao du model '" + objectClassName + "' n'a pas de datasource par défaut");
            }
            if (typeof this.config.datasources[datasourceName] == "undefined")
                throw new Error("Le datasource " + datasourceName + " n'est pas référencée dans la configuration");
            let datasource = this.config.datasources[datasourceName];
            var clazz = TdaoMysql_1.TdaoMysql;
            if (modelConfig.dao.class) {
                clazz = modelConfig.dao.class;
            }
            this._daoList[id] = new clazz(objectClassName, datasource, daoConfig);
            return this._daoList[id].init()
                .then(() => {
                return this._daoList[id];
            });
        }
        else {
            return Promise.resolve(this._daoList[id]);
        }
    }
}
exports.Tapplication = Tapplication;
//# sourceMappingURL=Tapplication.js.map