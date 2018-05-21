"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TclusterManager_1 = require("./cluster/TclusterManager");
const ThttpServer_1 = require("./services/HttpServer/ThttpServer");
const TcrudRestEndpoint_1 = require("./rest/TcrudRestEndpoint");
const TcrudServiceBase_1 = require("./TcrudServiceBase");
const TdaoMysql_1 = require("./dao/TdaoMysql");
const TeventDispatcher_1 = require("./events/TeventDispatcher");
const TlogManager_1 = require("./TlogManager");
const Promise = require("bluebird");
class Tapplication extends TeventDispatcher_1.TeventDispatcher {
    constructor(config) {
        super();
        this.appVersion = {
            "name": "1.0.0",
            "needReload": false
        };
        this.config = null;
        this.services = [];
        this.models = {};
        this.logger = null;
        this.ClusterManager = null;
        this._daoList = {};
        this.config = config;
        this.logManager = new TlogManager_1.TlogManager(this.config.logs);
        if (!this.config.clusterName)
            this.config.clusterName = "turbine";
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
            this.start();
        }
        else {
            this.logger.info("Node master started (PID=" + process.pid + ")");
            return Promise.resolve();
        }
    }
    registerService(svc) {
        this.services.push(svc);
        if (svc.active && (svc.executionPolicy == "one_per_process"))
            svc.start();
        else
            svc.stop();
    }
    getService(name) {
        var r = null;
        for (var i = 0; i < this.services.length; i++) {
            var svc = this.services[i];
            if (svc.name == name) {
                r = svc;
                break;
            }
        }
        return r;
    }
    onServerMasterChanged(e) {
        if (e.data)
            this.logger.info("This worker becomes SERVER_MASTER");
        else
            this.logger.info("This worker is no longer SERVER_MASTER");
        for (var i = 0; i < this.services.length; i++) {
            var svc = this.services[i];
            if (svc.active && (svc.executionPolicy == "one_per_server")) {
                if (e.data)
                    svc.start();
                else
                    svc.stop();
            }
        }
    }
    onIsMasterChanged(e) {
        if (e.data)
            this.logger.info("This worker becomes MASTER");
        else
            this.logger.info("This worker is no longer MASTER");
        for (var i = 0; i < this.services.length; i++) {
            var svc = this.services[i];
            if (svc.executionPolicy == "one_in_cluster") {
                if (e.data)
                    svc.start();
                else
                    svc.stop();
            }
        }
    }
    getLogger(name) {
        return this.logManager.getLogger(name);
    }
    start() {
        this.httpServer = new ThttpServer_1.ThttpServer("httpServer", this.config.services.httpServer);
        this.registerService(this.httpServer);
        return this.registerModelFromFile(this.config.defaultModelsPath + "/models");
    }
    registerModel(name, model) {
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
            var endpoint = new endpointClass({
                parentApi: this.httpServer.app,
                path: model.entryPoint.path,
                model: model,
                serviceClass: serviceClass
            });
            endpoint.init();
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