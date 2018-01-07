"use strict";

const TdaoBase = Turbine.dao.TdaoBase;
const moment = require('moment');
const arangojs = require('arangojs');

module.exports = class TservicesDao extends TdaoBase{

	constructor(config){  	
		
		super(config); 
		this.IDField = "_key";
		this.aql = arangojs.aql;

		var dbConf = {
			host: "localhost",
			port: "8529",
			database: "_system",
			username: "root",
			password: ""
		}
		
		this.db = arangojs({
  			url: `http://${dbConf.username}:${dbConf.password}@${dbConf.host}:${dbConf.port}`,
  			databaseName: dbConf.database
		});
	}  

	

	query(aql, callback){

		this.db.query(aql)
			.then(result => {
				
				if (callback){
					if (result._result)
			    		callback(null, result._result);
			    	else
			    		callback(null, result);
				}
			},
			err => {
			
				if (callback)
					callback(err, null);				
			}
		);
	}

	reset(callback)
	{
		var aql = this.aql`FOR u IN services
   			FILTER u.scheduled == true
    		UPDATE u WITH { scheduled: false } IN services`

		this.query(aql, function(err, result){
			
			if (callback)
			{
				if (err == null)
				    callback(null, result);	
				else
					callback(err, result)
			}
			
		});
	}

	

	getServicesToCheck( opt, callback ){//&& (u.duration_sec >= u.check_interval || u.duration_sec == null )
		var now = moment().valueOf();

		var aql = `FOR u IN services
			SORT u.last_check ASC
			LET duration = `+now+` - DATE_TIMESTAMP(u.last_check) 
   			FILTER u.enabled == true && u.scheduled == false && ( (u.last_check == null) || (duration > u.check_interval*1000))
   			LIMIT `+opt.limit+`
    		return u`
    	this.query(aql, callback)
		/*{ 
			where: 'enabled>0 AND scheduled=0 AND (duration_sec >= check_interval OR duration_sec IS NULL)',
			orderBy: 'last_check ASC',
			limit: limit
		}*/
	}

	saveServices(services, onCompleted){
		try{
			
			var data = [];
			for (var i=0; i<services.length; i++){
				var service = services[i]
				var lastCheck = moment(service.last_check);
				var item = {
					_key: service._key,
					scheduled: false ,
    				last_check: lastCheck.format(),
    				previous_check: null,
    				ellapsed: service.ellapsed,
    				current_state: service.current_state,
    				previous_check_timestamp: null,
    				last_check_timestamp: lastCheck.valueOf()
				}
			
				if (service.previous_check){
					var previousCheck = moment(service.previous_check);
					item.previous_check = previousCheck.format()
					item.previous_check_timestamp = previousCheck.valueOf()
				}

				if (typeof service.output != "undefined")
					item.output = service.output.replace(/'/g, "\\'").replace(/`/g, "\\`");
				else
					item.output = null

				data.push( item );
			}

			if (data.length > 0)
			{				
				this.bulkUpdate(data, {}, onCompleted)

			}else{
				if (onCompleted)
					onCompleted(null, 0);
			}
			
		}catch(err){	
			this.logger.debug(services, "saveServices");
			if (onCompleted)
				onCompleted(err, null);
			return;
		}
		
	}
 	
 	bulkUpdate(objects, opt, onCompleted)
 	{
		try{
			if (typeof opt == 'function')
				onCompleted = opt;

			var collection = this.db.collection('services');

			collection.bulkUpdate(objects, {returnNew:false})
			.then(result => {
					if (onCompleted)
						onCompleted(null, result);
			}, err => {
				    logger.error(err.message)
				    if (onCompleted)
						onCompleted(err, null);
			});	
			
		}catch(err){	
			this.logger.debug(objects, "bulkUpdate");
			if (onCompleted)
				onCompleted(err, null);
			return;
		}
		
	}

	setScheduled(idList, value, callback){

		if (idList.length > 0){

			var aql = `FOR u IN services
   			FILTER u._key IN `+JSON.stringify(idList)+`
    		UPDATE u WITH { scheduled: `+value+` } IN services`

			//_id IN [ 23, 42 ]

			this.query(aql, function(err, result){
				
				if (callback)
				{
					if (err == null)
					    callback(null, result);	
					else
						callback(err, null)
				}
			
			}.bind(this));

		}else{
			if (onCompleted)
				onCompleted(null, 0);
		}

	}


	importFromMysql(callback){

		this.daoServicesOld = app.getDao("TservicesDaoOld");

		this.daoServicesOld.getAll({}, function(services){

			var collection = db.collection('services');

			for (var i=0; i<services.length; i++){
				var service = services[i]

				var data = {
					  "id": service.id,					  
					  "args": JSON.parse(service.args),
					  "check_interval": service.check_interval,
					  "command_name": service.command_name,
					  "current_state": service.current_state,
					  "ellapsed": service.ellapsed,
					  "enabled": true,
					  "id_command": service.id_command,
					  "id_time_period": service.id_time_period,
					  "last_check": null,
					  "last_check_interval": null,
					  "last_check_timestamp": null,
					  "name": service.name,
					  "output": service.output,
					  "previous_check": null,
					  "previous_check_timestamp": null,
					  "scheduled": false,
					  "type": service.type
				}
			
				collection.save( data )
				.then(result => {
			
					logger.info("SAVE OK")
					if (callback)
						callback(null, result)
				}, err => {
					logger.error(err.message)					    
					if (callback)
						callback(err, null)
				});	

			}

		}.bind(this))

	}

}
 