import { TurbineException } from './TurbineException';
export class Forbidden extends TurbineException {
    constructor(message = null, code = 0) {
        if (!message)
            message = "Forbidden";
        super(message, code);
    }
}
