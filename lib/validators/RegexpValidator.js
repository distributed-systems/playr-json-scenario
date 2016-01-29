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
        , priority: 50



        /**
         * validate an array
         */
        , validate: function(name, data, validator, context) {
            let reg = new RegExp(validator.match, validator.flags);
            let input = this.toString(data);

            if (!reg.test(input)) return context.addMessage(`${name.cyan}: ${reg.toString().yellow} does not match ${(input || '').substr(0, 1000).grey}`);
            else return Promise.resolve();
        }
    });
})();
