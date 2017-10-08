"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tevent_1 = require("../events/Tevent");
const TeventDispatcher_1 = require("../events/TeventDispatcher");
class Ttimer extends TeventDispatcher_1.TeventDispatcher {
    constructor(args = {}) {
        super();
        this.delay = null;
        this.running = false;
        this.count = 0;
        this.intervalID = null;
        if (typeof args.delay != "number")
            throw "delay argument is mandatory";
        if (typeof args.onTimer == "function")
            this.on(Ttimer.ON_TIMER, args.onTimer);
        this.delay = args.delay;
    }
    start() {
        if (this.delay == null)
            throw "delay is null";
        if (!this.running) {
            this.running = true;
            this.intervalID = setInterval(this._onTimer.bind(this), this.delay);
        }
    }
    reset() {
        if (this.running) {
            this.stop();
            this.start();
        }
        this.count = 0;
    }
    stop() {
        this.running = false;
        this.count = 0;
        if (this.intervalID)
            clearInterval(this.intervalID);
        this.intervalID = null;
    }
    _onTimer(token) {
        if (this.running) {
            var evt = new Tevent_1.Tevent(Ttimer.ON_TIMER, {});
            this.dispatchEvent(evt);
            this.count++;
        }
    }
}
Ttimer.ON_TIMER = "ON_TIMER";
exports.Ttimer = Ttimer;
//# sourceMappingURL=Ttimer.js.map