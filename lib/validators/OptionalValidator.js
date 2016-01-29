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
        , priority: 10


        /**
         * validate an array
         */
        , validate: function(name, data, validator, context) {
            if (type.undefined(data)) {
                if (validator.value) return Promise.resolve(true);
                else return context.addMessage(`${name.cyan}: is not optional, got undefined!`);
            } else return Promise.resolve();
        }
    });
})();
