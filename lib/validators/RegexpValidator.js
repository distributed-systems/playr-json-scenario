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
                let reg = new RegExp(validator.match, validator.flags);
                let input = this.toString(data);

                if (!reg.test(input)) return Promise.resolve(`${name.cyan}: ${reg.toString().yellow} does not match ${(input || '').substr(0, 1000).grey}`);
                else return Promise.resolve();
            }
        }
    });
})();
