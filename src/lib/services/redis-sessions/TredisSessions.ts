import { TredisHttp } from '../redis-http/TredisHttp.js';

export class TredisSessions extends TredisHttp {

    constructor(name, server, config) {
        super(name, server, config);
    }
    getDefaultConfig() {
        var r = super.getDefaultConfig();
        r.apiPath = "/api/_plugin/redis-sessions";
        return r;
    }
}
