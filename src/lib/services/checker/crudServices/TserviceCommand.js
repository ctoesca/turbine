"use strict";

const TcrudServiceBase = Turbine.TcrudServiceBase;

module.exports = class TserviceCommand extends TcrudServiceBase {
 
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
					ClusterManager.getClient().publish("savePlugin", JSON.stringify(result));
					return result
				}.bind(this)

			)
	}

}
 