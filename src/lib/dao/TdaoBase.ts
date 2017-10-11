import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tapplication } from '../Tapplication';

declare var app: Tapplication

export class TdaoBase extends TeventDispatcher {
    config: any;
    logger: any;
    datasource: any;
    objectClassName: string

    constructor(objectClassName, datasource, config) {
        super();
        this.objectClassName = objectClassName;
        this.config = config;
        this.datasource = datasource;
        this.logger = app.getLogger(this.constructor.name);
        this.logger.info("Create DAO " + this.constructor.name);
    }
}
