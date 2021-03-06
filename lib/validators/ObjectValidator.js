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
        , priority: 90



        /**
         * validate an array
         */
        , validate: function(name, data, validator, context) {
            if (!type.object(data)) return context.addMessage(`${name.cyan}: ${type(data)} !== array`);
            else return Promise.resolve();
        }
    });
})();
