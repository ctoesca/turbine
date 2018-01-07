
import {TeventDispatcher} from '../../../events/TeventDispatcher';
import {Ttimer} from '../../../tools/Ttimer';
import {Tagent} from './Tagent';
import * as tools from '../../../tools';
import {Tapplication} from '../../../Tapplication';

import Promise = require("bluebird");
import fs = require('fs');
import bodyParser = require('body-parser'); 
import express = require('express');
import moment = require('moment');
import request = require('request');

export class ThttpApi extends TeventDispatcher {

	agent: Tagent
	constructor( agent, config )
	{
		super();
		this.agent = agent
	 	
	} 
	

	//GET
	request(opt){
		/* opt = {
		}*/

		var params = {
		};
		if (opt)
			params = tools.array_replace_recursive(params, opt);
		
		return this.agent._call("POST", "/api/http/request" , params);

	}


	//GET
	download(remotePath, localPath, opt){


		return new Promise(function(resolve, reject) {

			/* opt = [
				compress: boolean
			]*/
			var params: any = {
				"path" : remotePath
			};
			if (opt)
				params = tools.array_replace_recursive(params, opt);

			var url = this.agent.getUrl()+"/api/filesystem/download?path="+remotePath;
			
			var stream = fs.createWriteStream(localPath);
			/*stream.on('close', function () { 	
				logger.error("*************** close ")
				
			})*/

			opt = {
				url: url,
				timeout: 300000
			}
			var req = request(
				opt,
				function (err, response, body) {
	            
	                if (err){                
		             	this.agent.logger.error("Tagent.download url="+url+" : ", err);
	                   resolve({result: null, error: err.toString(), status: null})
	                }else{
	                	resolve({result: localPath, status:response.statusCode, headers: response.headers})
	                }
		
				}.bind(this)
				)//.pipe(stream)
			
		}.bind(this))

		//return HttpClient.httpDownload(url, localPath, params, httpOptions);
	}
	
	//POST
	upload(localPath, remotePath, opt){
		/* opt = [
			compress: boolean
		]*/
		var params: any = {
			"path" : remotePath,
			"overwrite" : true
		};
		if (opt)
			params = tools.array_replace_recursive(params, opt);

		var url = this.agent.getUrl()+"/api/filesystem/upload";

		var httpOptions = {
		};

		return HttpClient.httpUpload(url, localPath, params, httpOptions);
	}

	

}



