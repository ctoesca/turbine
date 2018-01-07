import {TeventDispatcher} from '../../../events/TeventDispatcher';
import {Ttimer} from '../../../tools/Ttimer';
import {Tevent} from '../../../events/Tevent';
import {TfsApi} from './TfsApi';
import {ThttpApi} from './ThttpApi';
import {TsshApi} from './TsshApi';
import {Tapplication} from '../../../Tapplication';
import {TagentEvent} from './TagentEvent';
import * as tools from '../../../tools';
import {TcrudServiceBase} from "../../../TcrudServiceBase"

import Logger = require("bunyan");

import Promise = require("bluebird");
import fs = require('fs');
import bodyParser = require('body-parser'); 
import express = require('express');
import moment = require('moment');
import request = require('request');

declare var app: Tapplication

export class Tagent extends TeventDispatcher {
	data: any
	httpConnectTimeout: number = 5000;
	httpTimeout : number = 300000;
	fs: TfsApi
	http: ThttpApi
	ssh: TsshApi
	dataService
	logger: Logger

	constructor( data )
	{
		super();
		
	 	this.data = data

		this.fs = new TfsApi(this, {})
		this.http = new ThttpApi(this, {})
		this.ssh = new TsshApi(this, {})
		this.dataService = new TcrudServiceBase({
			model:{
				  "name": "Agent",
					IDField: "id",
					"dao":{
					  	//"class": require("../src/services/checker/dao/TcommandsDao").TcommandsDao,
							"daoConfig": {
									datasource: "topvision",
									tableName: "agents",
									viewName: "agents"
							}
					},
					"entryPoint":"agents"
			}
		});//app.getDataService("Agent")
		this.logger = app.getLogger(this.constructor.name)
	} 

	destroy(){
		super.free()
	}
	get name(){
		return this.data.host+":"+this.data.port
	}

	set host(v){
		this.data.host = v
	}
	get host(){
		return this.data.host
	}
	save(){
		return this.dataService.save(this.data)
	}
	
	getUrl(){
		var r = "https://"+this.data.host+":"+this.data.port;
		if (!this.data.https)
			r = "http://"+this.data.host+":"+this.data.port;
		return r;
	}


	stop( opt )
	{
		var params = {}
		if (opt)
			params = tools.array_replace_recursive(params, opt);

		var r = this._call("GET", "/api/admin/stop" , params);
		return r;

	}

	setConfig( data , options = null )
	{
		var params = {
			"data" : data,
			"opt" : {}
		};
		if (options)
			params.opt = tools.array_replace_recursive(params.opt, options);

		var r = this._call("POST", "/api/setConfig" , params);
		return r;

	}

	getConfig( options = null)
	{ 

		var params = {};
		if (options)
			params = tools.array_replace_recursive( params, options);

		var r = this._call("POST", "/api/getConfig" , params)

		return r;

	}

	checkPort( host , port , opt )
	{
		var params: any = {
			"host" : host,
			"port" : port
		};
		if (opt)
			params = tools.array_replace_recursive(params, opt);
		
		var r = this._call("GET", "/api/checkPort" , params);
		return r;
	}

	check()
	{		
		var params = {};

		return this._call("GET", "/api/checkAgent" , params, {
			"connect_timeout" : 3000,
			"timeout" : 5000,
			"retryOnOtherAgents" : false				
		});     
	}



	_call(method, url, data , httpOptions = null)
	{
		return new Promise(function(resolve, reject) {

			var _httpOptions: any = {
				"retryOnOtherAgents": true,
				"connect_timeout" : this.httpConnectTimeout,
				"timeout" : this.httpTimeout
			}
			if (httpOptions)
				_httpOptions = tools.array_replace_recursive(_httpOptions, httpOptions);		
			
		
			var opt: any = { 
				method: method,
				url:  this.getUrl()+url,
				strictSSL: false,
				timeout:  this.httpTimeout,
				json: true,
				headers: {
					'User-Agent': 'topvision'
				}
			}

			if (typeof data == "object")
			{
				if (method == "GET")
				{
					opt.url += "?";
					var params = []
					for (var k in data)
						params.push(k+"="+data[k])
					opt.url += params.join("&")
				}else{					
					opt.body = data;
				}
			}else{
				if ((method == "POST")||(method == "PUT"))
				{
					opt.body = data;
				}

			}
	
			var req = request(
				opt,
				function (err, response, body) {
	           
	                if (err){                
		             	this.logger.debug("Tagent._call url="+opt.url+" : "+err.toString());
		             	err = new Error("Echec appel de l'agent "+this.name+": "+err.toString())
	                 
	                    req.abort()
	                  
	                   	var evt = new Tevent(TagentEvent.FAILURE, err)
	                	this.dispatchEvent(evt)
	                	if ( evt.data.retryWith && _httpOptions.retryOnOtherAgents)
	                	{
	                		this.logger.debug("!!! RETRY WITH AGENT ", evt.data.retryWith.name);
	                		evt.data.retryWith._call(method, url, data , httpOptions).then(function(result){
	                			resolve(result)
	                		}, function(err){
	                			reject(err)
	                		})
	                	}else{
	                		reject( err )
	                	}
	                   
	                }else
	                {	      

	                	/* L'agent renvoie toujours 200 (sauf si problème externe), avec un objet dans la réponse:
	                	Format de la réponse:
	                	HTTP 200:
	                	{
	                		isError: true/false,
	                		error: object/string
							status: xxx,
							result: "...body...",
							headers: { }
	                	}

	                	status, result et headers sont null si isError=true
	                	error est null si isError=false
	                	*/
	                	if (response.statusCode == 200)
	                	{
	          				resolve(body)
	                	}else
	                	{
							if (typeof body == "string")
								err = new Error("Echec appel de l'agent "+this.name+": statusCode="+response.statusCode+", body="+body)
							else
								err = new Error("Echec appel de l'agent "+this.name+": statusCode="+response.statusCode+", body="+JSON.stringify(body))
								
	                		evt = new Tevent(TagentEvent.FAILURE, err)
	                		this.dispatchEvent(evt)
	                		
	                		reject( err )
	                	}
	          			                	
	                }
		
				}.bind(this)
			)

		}.bind(this))
	}
	
	/*public function update( $srcPaths , $opt = NULL){
		
		$destZip = getTmpDir()."/node-agent-".this.id.".zip";
		if (file_exists($destZip))
            unlink($destZip);

		$params = [
			"dirNames" => []
		];

        for ($i=0; $i<count($srcPaths); $i++){
        	$srcPath = $srcPaths[$i];
        	zipDirectory($srcPath, $destZip);
        	$params["dirNames"][] = basename ( $srcPath );
        }
        //$params["dirNames"] = join(",", $params["dirNames"] );

		if (isset($opt))
			$params = array_merge($params, $opt);

		$url = this.getUrl()."/api/admin/update";

		$httpOptions = [
		];

		try{
			$httpResult = HttpClient::httpUpload($url, $destZip, $params, $httpOptions);
			$r["result"] = $httpResult->result;
			$r["error"] = false;
		}catch(\Exception $err){
			$r["result"] = $err->getMessage();
			$r["error"] = true;
		}
		return $r;
	}
	
	*/

}




