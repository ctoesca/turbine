
import {TcrudServiceBase} from '../../../TcrudServiceBase';
import {Tapplication} from '../../../Tapplication';
import Promise = require("bluebird");
declare var app: Tapplication

export class TserviceCommand extends TcrudServiceBase {
	
	constructor(config){  	
		super(config); 
	}  

	search(opt){
		return super.search(opt);
	}

	save(obj, opt){
	
		return super.save(obj, opt)
		.then( 
				function(result){
					app.ClusterManager.getClient().publish("savePlugin", JSON.stringify(result));
					return result
				}.bind(this)

		)
	}

}
 