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
        , priority: 60




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


            // the same for the validator
            if (validator.type === 'number' && type.string(validator.value) && !isNaN(validator.value)) {
                if (validator.value.indexOf('.') >= 0) validator.value = parseInt(validator.value, 10);
                else validator.value = parseFloat(validator.value);
            }

            if (validator.type === 'date' && type.string(validator.value) && !isNaN(new Date(validator.value).getTime())) {
                validator.value = new Date(validator.value);
            }


            // check the type
            if (type(data) !== validator.type) return context.addMessage(`${name.cyan}: ${type(data)} !== ${validator.type}`);
            else {

                switch (validator.comparator) {
                    case '=':
                        if (data === validator.value) return Promise.resolve();
                        else return context.addMessage(`${name.cyan}: ${this.toString(data)} !== ${this.toString(validator.value)}`);
                        break;


                    case '>':
                        if (validator.type === 'number') {
                            if (data > validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}: Expected value ${data} to be > ${validator.value}`);
                        }
                        else if (validator.type === 'string'){
                            if (data.length > validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}.length: Expected value ${data.length} to be > ${validator.value}`);
                        }
                        else return Promise.reject(new Error(`${name.cyan}: cannot compare ${validator.type} using the operator >`));
                        break;


                    case '>=':
                        if (validator.type === 'number') {
                            if (data >= validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}: Expected value ${data} to be >= ${validator.value}`);
                        }
                        else if (validator.type === 'string'){
                            if (data.length >= validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}.length: Expected value ${data.length} to be >= ${validator.value}`);
                        }
                        else return Promise.reject(new Error(`${name.cyan}: cannot compare ${validator.type} using the operator >=`));
                        break;


                    case '<':
                        if (validator.type === 'number') { 
                            if (data < validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}: Expected value ${data} to be < ${validator.value}`);
                        }
                        else if (validator.type === 'string'){
                            if (data.length < validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}.length: Expected value ${data.length} to be < ${validator.value}`);
                        }
                        else return Promise.reject(new Error(`${name.cyan}: cannot compare ${validator.type} using the operator <`));
                        break;


                    case '<=':
                        if (validator.type === 'number') {
                            if (data <= validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}: Expected value ${data} to be <= ${validator.value}`);
                        }
                        else if (validator.type === 'string'){
                            if (data.length <= validator.value) return Promise.resolve();
                            else return context.addMessage(`${name.cyan}.length: Expected value ${data.length} to be <= ${validator.value}`);
                        }
                        else return Promise.reject(new Error(`${name.cyan}: cannot compare ${validator.type} using the operator <=`));
                        break;


                    default: 
                        return Promise.reject(new Error(`${name.cyan}: Invalid comparator ${validator.comparator}!`));
                }
            }
        }
    });
})();
