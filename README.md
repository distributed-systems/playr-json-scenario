# playr-json-scenario

plays back request scenarios defined in a json file


[![npm](https://img.shields.io/npm/dm/playr-json-scenario.svg?style=flat-square)](https://www.npmjs.com/package/playr-json-scenario)
[![Travis](https://img.shields.io/travis/eventEmitter/playr-json-scenario.svg?style=flat-square)](https://travis-ci.org/eventEmitter/playr-json-scenario)
[![node](https://img.shields.io/node/v/playr-json-scenario.svg?style=flat-square)](https://nodejs.org/)




```javascript
let Playr = require('playr');
let JSONScenario = require('playr-json-scenario');


let playbook = new Playr();

playbook.run(new JSONScenario({
       path: __dirname+'/scenario.json'
     , url: 'http://master.cornercard.joinbox.com'
     , log: true
 }));

 playbook.use(new JSONScenario.ResponseValidator());

 playbook.play().then((stats) => {
     done();
 }).catch(log);
```
 


## Example Scenario
```javascript
{
      "author": "chrome-extension"
    , "description": "requests on all available apis"
    , "created": "2015-06-14 21:11:16"
    , "updated": "2015-10-14 20:40:56"
    , "version": "0.5.7"
    , "protocolVersion": "0.1.x"
    , "scenario": [{
          "kind": "request"
        , "id": "event-1"
        , "request": {
              "method": "GET"
            , "url": "https://www.emotions.cornercard.ch/event"
            , "headers": {
                  "accept": "application/json"
                , "accept-language": "de,fr,it,en"
                , "range": "0-60"
                , "select": "*, eventData.*"
                , "api-version": "1"
            }
        }
        , "response": {
              "status": 200
            , "body": [{
                  "kind": "type"
                , "type": "string"
            }]
            , "headers": {
                "date": {
                      "kind": "type"
                    , "type": "date"  
                }
                , "content-length": {
                      "kind": "comparator"
                    , "comparator": ">"
                    , "value": 200
                    , "type": "number"
                }
            }
            , "content": {
                  "kind": "array"
                , "length": {
                     "kind": "comparator"
                    , "comparator": "<"
                    , "type": "number"
                    , "value": 5000000
                }
                , "data": [{
                      "kind": "object"
                    , "data": {
                        "id": {
                              "kind": "comparator"
                            , "comparator": "<"
                            , "type": "number"
                            , "value": 500
                            , "optional": true
                        }
                        , "eventData": {
                              "kind": "array"
                            , "optional": false
                            , "data": { 
                                  "kind": "object"
                                , "data": {
                                    "id": {
                                          "kind": "comparator"
                                        , "comparator": "<"
                                        , "type": "number"
                                        , "value": 50000000
                                    }
                                }
                            }
                        }
                    }
                }]
            }
            , "responseTime": {
                  "kind": "comparator"
                , "comparator": "<"
                , "type": "number"
                , "value": 1000
            }
        }
    }, {
          "kind": "pause"
        , "duration": 200
    }, {
          "kind": "request"
        , "id": "event-2"
        , "request": {
              "method": "GET"
            , "url": "https://www.emotions.cornercard.ch/event/{event-1[50].id}"
            , "headers": {
                  "accept": "application/json"
                , "accept-language": "de,fr,it,en"
                , "range": "100-110"
                , "select": "*, eventData.*"
                , "api-version": "1"
            }
        }
        , "response": {
              "status": 200
            , "body": [{
                  "kind": "regexp"
                , "match": "presaleWebsiteUrl"
                , "flags": "gi"
            }, {
                  "kind": "type"
                , "type": "string"
            }]
            , "headers": {
                "date": {
                      "kind": "type"
                    , "type": "date"  
                }
                , "content-length": {
                      "kind": "comparator"
                    , "comparator": "<"
                    , "value": 2000
                    , "type": "number"
                }
            }
            , "content": {
                  "kind": "object"
                , "data": {
                    "id": {
                          "kind": "comparator"
                        , "comparator": "<"
                        , "type": "number"
                        , "value": 500
                        , "optional": true
                    }
                }
            }
        }
    }]
}
```