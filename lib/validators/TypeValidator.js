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
            else {
                // convert some types
                if (validator.type === 'number' && type.string(data) && !isNaN(data)) {
                    if (data.indexOf('.') >= 0) data = parseInt(data, 10);
                    else data = parseFloat(data);
                }

                if (validator.type === 'date' && type.string(data) && !isNaN(new Date(data).getTime())) {
                    data = new Date(data);
                }

                if (type(data) !== validator.type) return Promise.resolve(`${name.cyan}: ${type(data)} !== ${validator.type}`);
                else return Promise.resolve();
            }
        }
    });
})();
