"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TbaseService_js_1 = require("../TbaseService.js");
const exceptions = require("../../exceptions");
const tools = require("../../tools");
const express = require("express");
const http = require("http");
const rfs = require("rotating-file-stream");
const morgan = require("morgan");
const auth = require("basic-auth");
const pem = require("pem");
const Promise = require("bluebird");
const https = require("https");
module.exports = class Tserver extends TbaseService_js_1.TbaseService {
    constructor(name, config) {
        super(name, config);
        this.app = null;
        if (this.config.auth == null)
            this.logger.warn("Basic auth désactivé");
        else
            this.logger.info("Basic auth activé");
        if (this.config.allowedIp == null)
            this.logger.warn("Vérification de l'adresse IP désactivée");
        else
            this.logger.info("Allowed IP: " + this.config.allowedIp);
        if ((this.config.allowedIp == null) && (this.config.auth == null))
            this.logger.error("Basic Auth et Vérification IP désactivés: l'agent ne sera pas utilisable");
        this.app = express();
        this.app.set('trust proxy', 1);
    }
    setupSessions() {
        var session = require('express-session');
        var sessionStoreModule = require('connect-redis-cluster')(session);
        var storeOptions = {};
        if (this.config.session.storeOptions)
            storeOptions = this.config.session.storeOptions;
        storeOptions.client = app.ClusterManager.getNewClient();
        var sessionStore = new sessionStoreModule(storeOptions);
        var sessionsOptions = this.config.session.options;
        sessionsOptions.store = sessionStore;
        this.app.use(session(sessionsOptions));
    }
    start() {
        super.start();
        if (this.config && this.config["http-access-log"]) {
            var c = this.config["http-access-log"];
            if (c.enabled) {
                this.logger.info("Activation logging HTTP acces");
                c["log-dir"] = tools.replaceEnvVars(c["log-dir"]);
                var accessLogStream = rfs(c["log-name"], {
                    interval: c["rotating-period"],
                    path: c["log-dir"]
                });
                this.app.use(morgan('combined', { stream: accessLogStream }));
            }
        }
        for (var i = 0; i < this.config.static.virtualDirectories.length; i++) {
            var v = this.config.static.virtualDirectories[i];
            v.path = tools.replaceEnvVars(v.path);
            this.logger.info("virtualPath: " + v.url + " => " + v.path);
            var staticApp = express.static(v.path, this.config.static.options);
            this.app.use(v.url, staticApp);
        }
        this.app.use(this.authRequest.bind(this));
        this.createServer()
            .then(function (server) {
            this.server.timeout = this.config.requestTimeout * 1000;
            this.server.on('error', function (e) {
                if (e.code == 'EADDRINUSE') {
                    this.logger.error('Port ' + this.config.port + ' in use');
                    process.exit(0);
                }
            }.bind(this));
            this.initRoutes();
            this.listen();
        }.bind(this))
            .then(function () {
            this.setErrorsHandlers();
        }.bind(this))
            .catch(function (err) {
            process.exit(1);
        });
    }
    setErrorsHandlers() {
        this.app.use(function (req, res, next) {
            var err = new exceptions.NotFound('Not Found: ' + req.path);
            next(err);
        });
        this.app.use(function (err, req, res, next) {
            var status = err.status || 500;
            if (status == 0)
                status = 500;
            if (err instanceof exceptions.TurbineException) {
                if (err instanceof exceptions.Unauthorized)
                    status = 401;
                else if (err instanceof exceptions.Forbidden)
                    status = 403;
                else if (err instanceof exceptions.NotFound)
                    status = 404;
                else if (err instanceof exceptions.BadRequest)
                    status = 400;
            }
            if (status >= 500)
                this.logger.error("***** ", err);
            else
                this.logger.error("***** ", err.toString());
            if (!res.headersSent) {
                res.status(status).send({
                    error: err.toString(),
                    status: status
                });
            }
        });
    }
    listen() {
        tools.checkPort(this.config.bindAddress, this.config.port).then(function (result) {
            this.server.listen(this.config.port, function () {
                this.logger.info("API Server started listening on " + this.config.bindAddress + ":" + this.config.port);
            }.bind(this));
        }.bind(this));
    }
    use(path, app) {
        this.app.use(path, app);
    }
    createServer() {
        return new Promise(function (resolve, reject) {
            if (!this.config.https.enabled) {
                this.server = http.createServer(this.app);
                resolve(this.server);
            }
            else {
                if (this.config.https.pathOpenSSL) {
                    pem.config({
                        pathOpenSSL: this.config.https.pathOpenSSL
                    });
                }
                pem.createCertificate(this.config.https, function (err, keys) {
                    if (err) {
                        this.logger.error(err, "createCertificate");
                        reject(err);
                    }
                    else {
                        var credentials = { key: keys.serviceKey, cert: keys.certificate };
                        this.logger.debug(credentials.key);
                        this.logger.debug(credentials.cert);
                        this.server = https.createServer(credentials, this.app);
                        resolve(this.server);
                    }
                }.bind(this));
            }
        }.bind(this));
    }
    ipIsAllowed(ip) {
        if (this.config.allowedIp == null)
            return false;
        else
            return new RegExp(this.config.allowedIp).test(ip);
    }
    authRequest(req, res, next) {
        var ip = tools.getIpClient(req);
        var authok = false;
        var IPok = this.ipIsAllowed(ip);
        if (!IPok) {
            var user = auth(req);
            authok = this.config.auth && user && (user.name == this.config.auth.username) && (user.pass == this.config.auth.password);
            if (authok)
                authok = true;
        }
        else {
            authok = true;
        }
        if (authok) {
            return next();
        }
        else {
            if (this.config.auth)
                res.setHeader('WWW-Authenticate', 'Basic realm="ctop-agent-realm"');
            this.logger.warn("401 - Unauthorized ip=" + ip + ", user=" + user);
            this.logger.debug("body=", req.body);
            res.status(401).send("Unauthorized");
        }
    }
    getDefaultConfig() {
        var r = {
            "executionPolicy": "one_per_process",
            "http-access-log": {
                "enabled": true,
                "rotating-period": "7d",
                "log-name": "access.log",
                "log-dir": __dirname + "/../logs"
            },
            bindAddress: "127.0.0.1",
            port: 8080,
            https: {
                "enabled": true,
                "pathOpenSSL": null,
                "days": 365,
                "selfSigned": true
            },
            requestTimeout: 120,
            allowedIp: ".*",
            auth: null,
            "static": {
                "options": {
                    "lastModified": true,
                    "maxAge": '10d',
                },
                "virtualDirectories": [
                    {
                        "url": "/",
                        "path": __dirname + "/www"
                    }
                ]
            }
        };
        return r;
    }
    initRoutes() {
    }
};
//# sourceMappingURL=Tserver.js.map