
import {TdaoMysql} from '../../../dao/TdaoMysql';
import promise = require('bluebird');

export class TcommandsDao extends TdaoMysql {
 
	constructor(objectClassName, datasource, config){  	
		super(objectClassName, datasource, config); 
	}  

	processObjects(objects, fields)
	{
		for (var i=0; i<objects.length; i++)
		{
			var obj = objects[i]
			if (typeof obj.args == "string"){
				try{
					obj.args = JSON.parse(obj.args)
				}catch(err){
					this.logger.error("obj.args = "+obj.args+", "+err.toString())
				}
			}
		}
		return objects;
	}

	getByName(name): promise<any>
	{
		return this.select({
			where: "name like '"+name+"'"
		}).then( function(result: any[]){
			if (result.length >0)
				return result[0]
			else 
				return null
		})
	}
}
 