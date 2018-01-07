import { TurbineException } from './TurbineException';
export class BadRequest extends TurbineException {
    constructor(message = null, code = 0) {
        if (!message)
            message = "Bad Request";
        if (!code)
            code = 400;
        super(message, code);
    }
}
