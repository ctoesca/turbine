"use strict";

const TdaoMysql = Turbine.dao.TdaoMysql;

module.exports = class TtreeItemDao extends TdaoMysql{

	constructor(db, config){  	
		super(db, config); 
	}  
}
 