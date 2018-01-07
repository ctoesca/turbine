import { TurbineException } from './TurbineException';
export class NotFound extends TurbineException {
    constructor(message = null, code = 0) {
        if (!message)
            message = "NotFound";
        super(message, code);
    }
}
