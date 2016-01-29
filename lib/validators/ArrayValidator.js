(function() {
    'use strict';

    var   Class          = require('ee-class')
        , log            = require('ee-log')
        , type           = require('ee-types')
        , Validator      = require('./Validator')
        ;




    module.exports = new Class({
        inherits: Validator




        // the validators priority
        , priority: 100



        /**
         * validate an array
         */
        , validate: function(name, data, validator, context) {
            if (!type.array(data)) return context.addMessage(`${name.cyan}: ${type(data)} !== array`);
            else {
                if (!type.undefined(validator.length)) {
                    if (type.object(validator.length)) {
                        return this.middleware.validateProperty(`${name}.length`, validator.length, data.length, context);
                    }
                    else if (type.number(validator.length)) {
                        if (data.length !== validator.length) return context.addMessage(`${name}.length`.cyan+` !== ${validator.length.green}`);
                        else return Promise.resolve();
                    }
                    else return Promise.reject(new Error(`${name.cyan}: invalid valdiator for the array length. Expected number or object, got ${type(validator)}!`));
                }
                else return Promise.resolve(); 
            }
        }
    });
})();
