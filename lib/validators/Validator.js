(function() {
    'use strict';

    var   Class          = require('ee-class')
        , log            = require('ee-log')
        , type           = require('ee-types')
        ;




    module.exports = new Class({
        


        /**
         * validators need to access other validators
         */
        init: function(middleware) {
            this.middleware = middleware;
        }





        /**
         * get the best possible string representation of any input
         */
        , toString: function(input) {
            if (typeof input === 'object') {
                if (type.function(input.toJSON)) return input.toJSON();
                else if (type.function(input.toString)) return input.toString();
                else if (type.function(input.toValue)) return input.toValue();
                else return JSON.stringify(input);
            }
            else return input;
        }
    });
})();
