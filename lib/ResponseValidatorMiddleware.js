(function() {
    'use strict';

    var   Class                 = require('ee-class')
        , log                   = require('ee-log')
        , type                  = require('ee-types')
        , playr                 = require('playr')
        , ArrayValidator        = require('./validators/ArrayValidator')
        , ObjectValidator       = require('./validators/ObjectValidator')
        , ComperatorValidator   = require('./validators/ComperatorValidator')
        , TypeValidator         = require('./validators/TypeValidator')
        ;





    module.exports = new Class({
        inherits: playr.ResponseMiddleware




        // validator storage
        , validators: null





        /**
         * sets up the validators
         */
        , init: function() {
            this.validators = new Map();


            this.validators.set('array', new ArrayValidator(this));
            this.validators.set('object', new ObjectValidator(this));
            this.validators.set('comperator', new ComperatorValidator(this));
            this.validators.set('type', new TypeValidator(this));
        }







        /**
         * this method is called for every respüonse
         *
         * @param {response} response
         *
         * @returns {promise}
         */
        , applyTo: function(response) {
            let definition = response.getRequest().definition.response;

            if (definition) {
                let messages = [];

                return Promise.resolve().then(() => {

                    // HTTP Status
                    if (definition.status) return this.validate('HTTP Response Status', response.statusCode, definition.status);
                    else return Promise.resolve();
                }).then((result) => {
                    this.addMessages(messages, result);

                    // HTTP Headers
                    if (definition.headers) {
                        return Promise.all(Object.keys(definition.headers).map((headerName) => {
                            return this.validate(`HTTP Header ${headerName}`, response.headers[headerName.toLowerCase()], definition.headers[headerName]);
                        }));
                    }
                    else return Promise.resolve();
                }).then((result) => {
                    this.addMessages(messages, result);

                    // content
                    if (definition.content) return this.validateContent('Content', response.data, definition.content, messages);
                    else return Promise.resolve();
                }).then((result) => {

                    // we're done
                    if (messages.length) return Promise.reject(new Error(`Validation failed:\n ${messages.join('\n')}`));
                    return Promise.resolve();
                });
            }
            else return Promise.resolve();
        }









        /**
         * validates the content of a response
         */
        , validateContent: function(name, data, validators, messages) {
            if (type.array(validators)) {
                return Promise.all(validators.map((validator) => {
                    return this.validateContent(name, data, validator, messages);
                }));
            }
            else {
                return this.validate(name, data, validators).then((result) => {
                    this.addMessages(messages, result);

                    if (type.object(validators)) {
                        if (validators.kind === 'array') {

                            // validate each item in the array
                            return Promise.all(data.map((item, index) => {
                                return this.validateContent(`${name}[${index}]`, item, {
                                      kind: 'object'
                                    , data: validators.data
                                }, messages);
                            }));
                        }
                        else if (validators.kind === 'object') {

                            // got an object, validate properties
                            return Promise.all(Object.keys(validators.data).map((propertyName) => {
                                return this.validate(`${name}.${propertyName}`, data[propertyName], validators.data[propertyName]);
                            })).then((msgs) => {
                                this.addMessages(messages, msgs);
                                return Promise.resolve();
                            });
                        }
                        else return Promise.reject(new Error('Cannot handle an object valdiator at this point that is not of the array or object kind!'));
                    }
                    else return Promise.resolve();
                });
            }
        }











        /**
         * check for error messages returned by the validato
         */
        , addMessages: function(messages, results) {
            if (type.string(results) && results) messages.push(results);
            else if (type.array(results)) {
                results.forEach((result) => {
                    this.addMessages(messages, result);
                });
            }
        }









        /**
         * validates the http status
         * 
         */
        , validate: function(name, value, validator) {

            if (type.array(validator)) {

                // multiple validators
                return Promise.all(validator.map((v) => {
                    return this.validate(value, v);
                }));
            }
            else if (type.object(validator)) {

                // a single validator
                if (validator.kind && this.validators.has(validator.kind)) {
                    return this.validators.get(validator.kind).validate(name, value, validator);
                }
                else return Promise.reject(new Error(`Unknwon validator kind ${validator.kind}!`));
            }
            else {
                // value must equal the validator
                if (value === validator) return Promise.resolve();
                else {
                    let val = (type.object(value) && type.function(value.toString)) ? value.toString() : ((type.object(value) || type.array(value)) ? JSON.stringify(value): value);
                    let against = (type.object(validator) && type.function(validator.toString)) ? validator.toString() : ((type.object(validator) || type.array(validator)) ? JSON.stringify(validator): validator);

                    return Promise.resolve(`${name}: ${val} !== ${against}`);
                }
            }
        }
    });
})();
