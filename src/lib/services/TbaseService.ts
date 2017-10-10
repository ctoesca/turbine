import { TeventDispatcher } from '../events/TeventDispatcher';
import { Iapplication } from '../Iapplication';

import shell = require("shell")

declare var app : Iapplication

export abstract class TbaseService extends TeventDispatcher {

    name: string = null;
    config: any = null;
    started: boolean = false;
    active: boolean = false;
    executionPolicy: string = null;
    logger: any;


    constructor(name, config) {
        super();
        this.name = name
        this.config = this.getDefaultConfig();
        if (config) {
            for (var k in config)
                this.config[k] = config[k];
        }
        this.executionPolicy = this.config.executionPolicy;
        this.active = this.config.active

        try {
            if (typeof this.config.dataDir != "undefined")
                shell.mkdir('-p', this.config.dataDir);
        }
        catch (e) {
            if (e.code != 'EEXIST')
                throw e;
        }

        this.logger = app.getLogger(this.name);
        this.logger.info("Creation service '" + this.name + "'. executionPolicy=" + this.executionPolicy);

    }

    abstract getDefaultConfig()

    start() {



        if (this.active && !this.started) {
            this.logger.info("service '" + this.name + "' started.");
            this.started = true;
        }
    }
    stop() {
        if (this.started) {
            this.started = false;
            this.logger.info("service '" + this.name + "' stopped.");
        }
    }
}
