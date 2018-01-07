import {Tevent} from '../../../events/Tevent';

export class TagentEvent extends Tevent {

	static FAILURE = "FAILURE"

	constructor( type: string,
      eventData: any =  null,
      cancelable: boolean = true)
	{
		super(type, eventData, cancelable);
		
	} 
}


