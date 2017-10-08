import { Tevent } from '../events/Tevent';
import { TeventDispatcher } from '../events/TeventDispatcher';

export class Ttimer extends TeventDispatcher {

    delay: number = null;
    running: boolean = false;
    count: number = 0;
    intervalID: any = null;
    static ON_TIMER: string = "ON_TIMER";

    constructor(args:any = {}) {
        super();

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
            var evt = new Tevent(Ttimer.ON_TIMER, {});
            this.dispatchEvent(evt);
            this.count++;
        }
    }
}
