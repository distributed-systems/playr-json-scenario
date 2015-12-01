(function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , playr         = require('playr')
        ;





    module.exports = new Class({
        inherits: playr.ScenarioContext




        , init: function init(scenario) {
            init.super.call(this, scenario);


            // map for responses that must be cached
            this.responseCache = new Map();
        }










        /**
         * the scenario may need a response in order to 
         * create the next request
         */
        , setResponse: function(response) {
            let id = response.getRequest().id;


            // check if this response is used later on
            if (this.scenario.responseCacheIds.has(id)) {

                // add to the map
                this.responseCache.set(id, response);

                // let the outside know
                this.emit(id, response);
            }            
        }
    });
})();
