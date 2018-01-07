import { TeventDispatcher } from '../../events/TeventDispatcher';

export class Message extends TeventDispatcher {
    id: any;
    constructor() {
        super();
        this.id = null;
    }
}
