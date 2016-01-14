(function() {
	'use strict';

	var   Class 		    = require('ee-class')
        , type              = require('ee-types')
        , fs                = require('fs')
		, log 			    = require('ee-log')
        , playr             = require('playr')
        , ScenarioContext   = require('./ScenarioContext')
        ;



	module.exports = new Class({
        inherits: playr.Scenario


        // default name
        , name: 'JSON Scenario'




		, init: function init(options) {

            // a path to the json file is required
            if (!options || (!options.path && !options.data)) throw new Error('The JSON Scenario needs a path to a json file!');
            this.path = options.path;
            this.url = options.url;
            this.log = options.log;
            this.data = options.data;


            // storage for the requests
            this.requests = new Map();

            // storage which defiens which response to cache
            this.requestCacheInstruction = new Map();

            // a list of all responses that must be cached
            this.responseCacheIds = new Set();


            // call super
            init.super.call(this, options);
		}






        /**
         * the scenario needs to be instantiated for 
         * every thread. this creates a new storage
         * context for the thread
         *
         * @returns {object} context
         */
        , createContext: function() {
            return new ScenarioContext(this);
        }







        /**
         * checks if a request with the given
         * index exists
         *
         * @param {number} index the request index
         *
         * @returns {boolean} 
         */
        , hasRequestAt: function(index, context) {
            return this.requests.has(index);
        }








        /** 
         * returns a request that can be executed
         *
         * @param {number} index the request index
         *
         * @returns {promise}
         */
        , getRequestAt: function(index, request, context) {
            let requestDefinition = this.requests.get(index);

            // the requets must know its definition
            // so it can be validated
            request.definition = requestDefinition.request;


            let execPreroll = (index) => {
                if (requestDefinition.preroll.length > index) {
                    if (requestDefinition.preroll[index].kind === 'pause') {
                        return new Promise((resolve) => {
                            setTimeout(resolve, requestDefinition.preroll[index].duration);
                        });
                    }
                    else return Promise.reject(new Error(`Cannot execute preroll item of the kind ${requestDefinition.preroll[index].kind}`));
                }
                else return Promise.resolve();
            };


            return execPreroll(0).then(() => {
                
                // nice, the preroll was executed
                // maybe we have to wait for the 
                // response from a previous request
                if (requestDefinition.request.parameterized) {

                    // make sure all required responses are available
                    return Promise.all(requestDefinition.request.requiredResponses.map((requestId) => {

                        if (context.responseCache.has(requestId)) return Promise.resolve({requestId: requestId, response: context.responseCache.get(requestId)});
                        else {

                            // we have to wait for the response
                            return new Promise((resolve, reject) => {
                                let hasTimeout = false;

                                setTimeout(() => {
                                    hasTimeout = true;
                                    reject(new Error(`Timeout while waiting for the response of the ${requestDefinition.request.id} request!`));
                                }, 30000);

                                context.once(requestId, (response) => {
                                    if (!hasTimeout) resolve({requestId: requestId, response: response});
                                });
                            });
                        }
                    })).then((responseData) => {
                        let responseDataMap = {};

                        responseData.forEach((instruction) => {
                            responseDataMap[instruction.requestId] = instruction.response;
                        });

                        return this.popoulateRequest(requestDefinition, request, responseDataMap);
                    });
                }
                else {

                    // k, we're ready
                    return this.popoulateRequest(requestDefinition, request);
                }
            });
        }








        /**
         * configres the http request
         */
        , popoulateRequest: function(requestDefinition, request, responseDataMap) {
            let definition = requestDefinition.request;



            // id
            if (definition.id) request.id = definition.id;

            // methd && url 
            request.url = definition.request.url;
            request.method = definition.request.method;


            // check if we have to oevrride the domain
            if (this.url) request.url = request.url.replace(/^https?:\/\/[^\/]+\//i, this.url+'/');


            // headers
            if (definition.request.headers) {
                Object.keys(definition.request.headers).forEach((headerName) => {
                    request.headers[headerName] = definition.request.headers[headerName];
                });
            }

            // query
            if (definition.request.query) {
                Object.keys(definition.request.query).forEach((parameterName) => {
                    request.query[parameterName] = definition.request.query[parameterName];
                });
            }

            // content
            if (definition.request.content) {
                Object.keys(definition.request.content).forEach((parameterName) => {
                    request.form[parameterName] = definition.request.content[parameterName];
                });
            }

            if (definition.request.body) request.body = definition.request.body;


            if (definition.id) {
                let instructions = this.requestCacheInstruction.get(definition.id);
                
                if (definition.parameterizedURL) {
                    instructions.url.forEach((instruction) => { 
                        request.url = request.url.replace(instruction.match, this.getContentItem(responseDataMap[instruction.requestId].data, instruction.path));
                    });
                }


                if (definition.parameterizedContent) {
                    Object.keys(instructions.content).forEach((key) => {
                        let instructionSet = instructions.content[key];

                        instructionSet.forEach((instruction) => {
                            if (request.form[key]) {
                                request.form[key] = request.form[key].replace(instruction.match, this.getContentItem(responseDataMap[instruction.requestId].data, instruction.path));
                            }
                        });
                    });
                    
                }
            }

            // logging?
            if (this.log) console.log(request.method.toUpperCase().green+' '+request.url.white);


            return Promise.resolve();
        }












        /**
         * extracts a value from a json object
         */
        , getContentItem: function(content, path) {
            if (path && path.length) {
                if (path[0] === '[') {
                    let index = parseInt(path.substring(1, path.indexOf(']')), 10);

                    if (Array.isArray(content) && content[index]) {
                        return this.getContentItem(content[index], path.substr(path.indexOf(']')+2));
                    }
                    else return null;
                }
                else {
                    if (typeof content === 'object' && content !== null) {

                        // path is a property name
                        if (path.indexOf('[') >= 0) {
                            // there is an array on the proeprty
                            return this.getContentItem(content[path.substring(0, path.indexOf('['))], path.substr(path.indexOf('[')));
                        }
                        else if (path.indexOf('.') >= 0) {
                            // object
                            return this.getContentItem(content[path.substring(0, path.indexOf('.'))], path.substr(path.indexOf('.')));
                        }
                        else {
                            // got it
                            return content[path];
                        }
                    }
                }
            }
        }








        /**
         * time to prepare the scenario if there is 
         * anything to load it should be done here
         *
         * @returns {promise}
         */
        , prepare: function() {
            return this.loadJSONdata().then(() => {

                // go through all requests, look if we need to cache responses
                this.scenario.forEach((item) => {
                    if (item.kind === 'request') {
                        let reg = /(\{([a-z0-9\-]+)([\[\]0-9\.a-z]+)\})/gi;
                        let result;

                        // url
                        while(result = reg.exec(item.request.url)) {
                            if (!this.requestCacheInstruction.has(item.id)) this.requestCacheInstruction.set(item.id, {url: [], content: {}});
                            let instruction = this.requestCacheInstruction.get(item.id);

                            instruction.url.push({
                                  match: result[1]
                                , requestId: result[2]
                                , path: result[3]
                            });

                            if (!this.responseCacheIds.has(result[2])) this.responseCacheIds.add(result[2]);

                            item.parameterized = true;
                            item.parameterizedURL = true;
                                        
                            if (!item.requiredResponses) item.requiredResponses = [];
                            item.requiredResponses.push(result[2]);
                        }


                        if (item.request.content) {

                            // check the content too
                            Object.keys(item.request.content).forEch((key) => {
                                if (item.request.content[key] === 'string') {
                                    reg.lastIndex = 0;

                                    while(result = reg.exec(item.request.content[key])) {
                                        if (!this.requestCacheInstruction.has(item.id)) this.requestCacheInstruction.set(item.id, {url: [], content: {}});
                                        let instruction = this.requestCacheInstruction.get(item.id);

                                        if (!instruction.content[key]) instruction.content[key] = [];

                                        instruction.content[key].push({
                                              match: result[1]
                                            , requestId: result[2]
                                            , path: result[3]
                                        });

                                        if (!this.responseCacheIds.has(result[2])) this.responseCacheIds.add(result[2]);

                                        item.parameterized = true;
                                        item.parameterizedContent = true;

                                        if (!item.requiredResponses) item.requiredResponses = [];
                                        item.requiredResponses.push(result[2]);
                                    }
                                }
                            });
                        }
                    }
                });

                
                // count the requests
                let preroll = [];

                this.scenario.forEach((item) => {
                    if (item.kind === 'request') {
                        this.requests.set(this.requests.size, {
                              request: item
                            , preroll: preroll
                        });

                        preroll = [];
                    }
                    else preroll.push(item);
                });


                return Promise.resolve();
            });
        }







        /** 
         * load either a file or takes the object passed 
         * to the constructor
         */
        , loadJSONdata: function() {
            if (this.data) {
                this.scenario = this.data.scenario || this.data;
                return Promise.resolve();
            }
            else {
                return new Promise((resolve, reject) => {
                    fs.readFile(this.path, (err, data) => {
                        if (err) reject(new Error(`Failed to load JSON scenario ${this.path}: ${err.message}`));
                        else {
                            try {
                                this.data = JSON.parse(data);
                            } catch (e) {
                                return reject(new Error(`Failed to parse JSON scenario ${this.path}: ${err.message}`));
                            }


                            if (this.data.scenario) {
                                this.scenario = this.data.scenario;

                                resolve();
                            }
                            else reject(new Error(`Missing the scenario in the JSON scenario ${this.path}!`));
                        }
                    });
                });
            }
        }
	});
})();
