import { TurbineException } from './TurbineException';
export class Unauthorized extends TurbineException {

    constructor(message = null, code = 0) {
        if (!message)
            message = "Unauthorized";
        super(message, code);
    }
}
