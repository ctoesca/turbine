import { TeventDispatcher } from '../events/TeventDispatcher';
import { Tapplication } from '../Tapplication';

declare var app: Tapplication

export class TdaoBase extends TeventDispatcher {
    config: any;
    logger: any;
    constructor(config) {
        super();
        this.config = config;        
        this.logger = app.getLogger(this.constructor.name);
        this.logger.debug("Create DAO " + this.constructor.name);
    }
}
