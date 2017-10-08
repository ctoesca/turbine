"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TredisHttp_js_1 = require("../redis-http/TredisHttp.js");
class TredisSessions extends TredisHttp_js_1.TredisHttp {
    constructor(name, server, config) {
        super(name, server, config);
    }
    getDefaultConfig() {
        var r = super.getDefaultConfig();
        r.apiPath = "/api/_plugin/redis-sessions";
        return r;
    }
}
exports.TredisSessions = TredisSessions;
//# sourceMappingURL=TredisSessions.js.map