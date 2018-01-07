export class Tevent {
    type: string = null;
    data: any = null;
    cancelable: boolean = false;
    currentTarget: any = null;
    cancelled: boolean = false;
    defaultPrevented: boolean = false;
    bind: () => void = null;
    relatedData: any = null;

    /**
        @class turbine.events.Tevent
        @classdesc Evènement.
        @param {string} type Type d'évènement
        @param {any} eventData  Donnée associée à cet évènement, accessible sous la propriété 'data'.
        @param {boolean} cancelable
    */
    constructor(
      type: string,
      eventData: any =  null,
      cancelable: boolean = true)
      {
        if (arguments.length > 0)
            this.type = type;
        if (arguments.length > 1)
            this.data = eventData;
        if (arguments.length > 2)
            this.cancelable = cancelable;
    }
    preventDefault() {
        this.defaultPrevented = true;
    }
}
