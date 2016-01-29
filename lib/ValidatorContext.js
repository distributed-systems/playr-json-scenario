(function() {
    'use strict';

    var   Class             = require('ee-class')
        , type              = require('ee-types')
        , fs                = require('fs')
        , log               = require('ee-log')
        ;



    module.exports = new Class({


        init: function() {

            // message storage
            this.messages = [];
        }




        , addMessage: function(message, abort) {
            return this.addMessages(message);
        }


        /**
         * store error messages
         */
        , addMessages: function(messages, abort) {
            if (type.string(messages)) this.messages.push(messages);
            else if (type.array(messages)) {
                messages.forEach((message) => {
                    this.messages.push(message);
                });
            }

            return Promise.resolve(!!abort);
        }
    });
})();
