"use strict";

const TdaoMysql = Turbine.dao.TdaoMysql;

module.exports = class ThistoDao extends TdaoMysql{

	constructor(db, config){  	
		super(db, config); 
	}  
}
 