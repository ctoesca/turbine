"use strict";

const TdaoMysql = Turbine.dao.TdaoMysql;

module.exports = class TconnexionsDao extends TdaoMysql {
 
	constructor(db, config){  	
		super(db, config);  
	}  

	processObjects(objects, fields)
	{
		return objects;
	}

	getByHost(host){
		return this.select({
			where: "host like '"+host+"'"
		}).then( function(result){
			
			return result
			
		})
	}

	getByHostAndPort(host, port){
		return this.select({
			where: "host like '"+host+"' AND port like '"+port+"'"
		}).then( function(result){
			
			return result
			
		})
	}
}
 