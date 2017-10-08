import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tapplication } from '../Tapplication';

import express = require('express');

declare var app: Tapplication

export class TrestEndpoint extends TeventDispatcher {

    config: any = null;
    parentApi: express.Application = null;
    path: string = "/";
    app: express.Application = null;
    logger = null

    constructor(config, options) {
        super();

        this.logger = app.getLogger(this.constructor.name)

        this.config = config;
        this.parentApi = config.parentApi;
        this.path = config.path;
        this.app = express();
        this.app.use(this.onBeforeRequest.bind(this));
        this.parentApi.use(this.path, this.app);

    }
    setXTime(res: express.Response, startTime: Date) {
        var xTime = new Date().getTime() - startTime.getTime();
        res.set('X-Time', xTime.toString());
    }
    onAfterRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
        this.logger.debug("onAfterRequest");
    }
    sendResponse(req: express.Request, res: express.Response, next, result, status = 200) {
        res.status(status).send(result);
        this.onAfterRequest(req, res, next);
    }
    getUser(req: express.Request) {
        //return app.connexionManager.getUserSession(req);
        return null
    }
    onBeforeRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
        req["_user"] = this.getUser(req);
        next();
    }
    init() {
    }
}
