"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("./lib/events");
class TtestClass extends events.TeventDispatcher {
    contains(item, str) {
        console.log("************************************* " + item);
        this.dispatchEvent(new events.Tevent("READY", "ok"));
    }
}
exports.TtestClass = TtestClass;
//# sourceMappingURL=TtestClass.js.map