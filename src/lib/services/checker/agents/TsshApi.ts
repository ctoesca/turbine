
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

export class TsshApi extends TeventDispatcher {

	agent: Tagent

	constructor( agent, config )
	{
		super();
		this.agent = agent
	 	
	} 
	

	//POST
	exec(opt)
	{
		var params = {
		};
		if (opt)
			params = tools.array_replace_recursive(params, opt);
		
		return this.agent._call("POST", "/api/ssh/exec" , params);
	}

	//GET
	moveFile(path, dest,  opt)
	{
		var params: any = {
			"path" : path,
			"dest" : dest
		};
		if (opt)
			params = tools.array_replace_recursive(params, opt);
		
		return this.agent._call("GET", "/api/filesystem/moveFile" , params);

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

	//POST
	execScript( script, opt ){
		/* opt = [
			type: shell|javascript
			args: []
		]*/

		var params: any = {
			"script" : script
		};
		if (opt)
			params = tools.array_replace_recursive(params, opt);
		
		return this.agent._call("POST", "/api/filesystem/execScript" , params).then( (result: any) => {
			result.stdout = result.stdout.replace(/\r\n/g, "\n");
			result.stderr = result.stderr.replace(/\r\n/g, "\n");
			return result;
		})


	}

	//POST
	writeTextFile( path, content, opt){

		var params: any = {
			"path" : path,
			"content" : content
		};
		if (opt)
			params = tools.array_replace_recursive(params, opt);
		
		return this.agent._call("POST", "/api/filesystem/writeTextFile" , params);		
	}	

}



