
import {TdaoMysql} from '../../../dao/TdaoMysql';
import promise = require('bluebird');

export class TagentsDao extends TdaoMysql {
 
	constructor(objectClassName, datasource, config) {
        super(objectClassName, datasource, config);		
	}  

	getByHostAndPort(host, port, status){
		
		var sql = "host like '"+host+"' AND port like '"+port+"'"
		if (arguments.length > 2)
			sql += " AND status="+status

		return this.select({
			where: sql
		}).then( function(result: object[]){
			if (result.length >0)
				return result[0]
			else 
				return null
		})
	}
	
}
 