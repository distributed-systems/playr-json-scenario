(function() {
    'use strict';

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert')
        , Playr         = require('playr');



	var   JSONScenario = require('../')
        , ResponseValidator = require('../').ResponseValidator





    describe('The JSON Scenario', function(){
        it('should work ;)', function(done) {
            this.timeout(5000);

            let playbook = new Playr();

            playbook.run(new JSONScenario({
                  path: __dirname+'/scenario2.json'
                , url: 'http://master.cornercard.joinbox.com'
                , log: true
            }));


            playbook.use(new ResponseValidator());


            playbook.play().then((stats) => {
                //log(stats)
                done();
            }).catch(done);
        });
    });
})();
