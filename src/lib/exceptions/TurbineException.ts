export class TurbineException extends Error {

    code: number = 0;
    constructor(message, code = 0) {
        super(message);
        if (arguments.length > 1)
            this.code = code;
        else
            this.code = 1;
    }
}
