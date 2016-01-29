(function() {
    'use strict';

    var   Class                 = require('ee-class')
        , log                   = require('ee-log')
        , type                  = require('ee-types')
        , playr                 = require('playr')
        , ValidatorContext      = require('./ValidatorContext')
        , ArrayValidator        = require('./validators/ArrayValidator')
        , ObjectValidator       = require('./validators/ObjectValidator')
        , ComparatorValidator   = require('./validators/ComparatorValidator')
        , TypeValidator         = require('./validators/TypeValidator')
        , RegexpValidator       = require('./validators/RegexpValidator')
        , OptionalValidator     = require('./validators/OptionalValidator')
        , NullableValidator     = require('./validators/NullableValidator')
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
            this.validators.set('comparator', new ComparatorValidator(this));
            this.validators.set('type', new TypeValidator(this));
            this.validators.set('regexp', new RegexpValidator(this));
            this.validators.set('optional', new OptionalValidator(this));
            this.validators.set('nullable', new NullableValidator(this));
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

            // new validator context
            let context = new ValidatorContext();


            if (definition) {
                return Promise.resolve().then(() => {

                    // HTTP Status
                    if (definition.status) return this.validateProperty('HTTP Response Status', definition.status, response.statusCode, context);
                    else return Promise.resolve();
                }).then((result) => {

                    // HTTP Headers
                    if (definition.headers) {
                        return Promise.all(Object.keys(definition.headers).map((headerName) => {
                            return this.validateProperty(`HTTP Header ${headerName}`, definition.headers[headerName], response.headers[headerName.toLowerCase()], context);
                        }));
                    }
                    else return Promise.resolve();
                }).then((result) => {

                    // content
                    if (definition.content) return this.validateContent(definition.content, response.data, context);
                    else return Promise.resolve();
                }).then((result) => {

                    // body string
                    if (definition.body) return this.validateProperty('HTTP Response Body', definition.body, response.body, context);
                    else return Promise.resolve();
                }).then((result) => {

                    if (definition.responseTime) return this.validateProperty('HTTP Response Time', definition.responseTime, (response.endTime - response.getRequest().startTime), context);
                    else return Promise.resolve();
                }).then((result) => {

                    // we're done

                    // check if the hook for getting messages instead of 
                    // printing the is set
                    if (type.function(this.resultHook)) this.resultHook(context.messages);
                    else {
                        if (context.messages.length) return Promise.reject(new Error(`Validation failed:\n ${context.messages.join('\n')}`));
                        return Promise.resolve();
                    }
                });
            }
            else return Promise.resolve();
        }









        /**
         * validate the data. 
         *
         */
        , validateContent: function(validators, data, context) {

            // check if we got any validators
            if (validators && (type.object(validators) || type.array(validators))) {

                // pass this to the generic validator engine
                return this.validateProperty('HTTP Response Body', validators, data, context);
            } else return Promise.resolve();
        }








        /**
         * valdiates one property
         */
        , validateProperty: function(name, validators, data, context) {


            // multiple validators
            if (type.array(validators)) {

                // sort the validatory by their priority
                validators.sort((a, b) => {
                    let validatorAPriority = this.validators.has(a.kind) ? this.validators.get(a.kind).priority : -10;
                    let validatorBPriority = this.validators.has(b.kind) ? this.validators.get(b.kind).priority : -10;

                    return validatorAPriority > validatorBPriority ? 1 : -1;
                });

                
                // execute one validator after another, stop 
                // when a validator tells us to do so
                let executor = (index) => {
                    if (validators.length > index) {
                        return this.validateProperty(name, validators[index], data, context).then((abort) => {
                            if (abort) return Promise.resolve();
                            else return executor(index+1); 
                        });
                    }
                    else return Promise.resolve();
                };


                return executor(0);
            } 




            // one single validator
            else if (type.object(validators)) {

                // first apply the validator
                if (!this.validators.has(validators.kind)) return Promise.reject(new Error(`${name.cyan}: invalid valdiator. Validator kind ${validators.kind} unkown on object ${JSON.stringify(validators)}!`));
                else {
                    return this.validators.get(validators.kind).validate(name, data, validators, context).then((abort) => {

                        if (abort) return Promise.resolve();
                        else if (validators.kind === 'array') {

                           
                            // then check if there is content to check for
                            // it is an array or null or undefined which is ok
                            if (type.array(data)) {

                                // check each item 
                                return Promise.all(data.map((item, index) => {
                                    return this.validateProperty(`${name}[${index}]`, validators.data, item, context);
                                })).then((results) => {
                                    return Promise.resolve(results.some(a => !!a));
                                });
                            } else return Promise.resolve();
                        }


                        else if (validators.kind === 'object') {


                            // if the content is an object, its valiadatable
                            if (type.object(data)) {

                                // got an object, validate properties
                                return Promise.all(Object.keys(validators.data).map((propertyName) => {
                                    return this.validateProperty(`${name}.${propertyName}`, validators.data[propertyName], data[propertyName], context);
                                })).then((results) => {
                                    return Promise.resolve(results.some(a => !!a));
                                });
                            } else return Promise.resolve();
                        }


                        // ok :)
                        else return Promise.resolve();
                    });
                }
            }



            // problem! the validator looks not too good
            else {
                return this.validators.get('comparator').validate(name, data, {
                      kind: 'comparator'
                    , comparator: '='
                    , type: type(validators)
                    , value: validators
                }, context);
            }
        }
    });
})();
