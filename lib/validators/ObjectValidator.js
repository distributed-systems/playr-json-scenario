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
            else if (!type.object(data)) return Promise.resolve(`${name}: ${type(data)} !== array`);
            else return Promise.resolve();
        }
    });
})();