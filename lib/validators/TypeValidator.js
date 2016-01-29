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
        , priority: 40




        /**
         * validate an array
         */
        , validate: function(name, data, validator, context) {
            // convert some types
            if (validator.type === 'number' && type.string(data) && !isNaN(data)) {
                if (data.indexOf('.') >= 0) data = parseInt(data, 10);
                else data = parseFloat(data);
            }

            if (validator.type === 'date' && type.string(data) && !isNaN(new Date(data).getTime())) {
                data = new Date(data);
            }

            if (type(data) !== validator.type) return context.addMessage(`${name.cyan}: ${type(data)} !== ${validator.type}`);
            else return Promise.resolve();
        }
    });
})();
