(function() {
    'use strict';

    var   Class          = require('ee-class')
        , log            = require('ee-log')
        , type           = require('ee-types')
        , Validator      = require('./Validator')
        ;




    module.exports = new Class({
        inherits: Validator





        /**
         * validate an array
         */
        , validate: function(name, data, validator) {
            if (validator.optional && type.undefined(data)) return Promise.resolve();
            else if (validator.nullable && data === null) return Promise.resolve();
            else if (!type.array(data)) return Promise.resolve(`${name}: ${type(data)} !== array`);
            else {
                if (!type.undefined(validator.length)) {
                    if (type.object(validator.length)) {
                        return this.middleware.validate(`${name}.length`, data.length, validator.length);
                    }
                    else if (type.number(validator.length)) {
                        if (data.length !== validator.length) return Promise.resolve(`${name}.length !== ${validator.length}`);
                        else return Promise.resolve();
                    }
                    else return Promise.reject(`${name}: invalid valdiator for the array length. Expected number or object, git ${type(validator)}!`);
                }
                else return Promise.resolve(); 
            }
        }
    });
})();
