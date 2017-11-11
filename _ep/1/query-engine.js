var rdfstore = require('rdfstore');
var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');

//Promisify callback functions
var readFile = Promise.promisify(fs.readFile);
var createStore = Promise.promisify(rdfstore.create);

//Variables
var path = 'static/triples.ttl'

var getTriples = readFile(path).then(buffer => buffer.toString());

function loadTriplesInStore(store, triples){
    return new Promise((resolve, reject) => {
        store.load('text/turtle', triples, (err, res) => {
            if(err) reject(err);
            resolve(res);
        })
    })
}

function executeQuery(store, query, accept){
    start = Date.now();
    return new Promise((resolve, reject) => {
        store.execute(query, (err, res) => {
            if(err) reject(err);
            end = Date.now();
            elapsed = (end-start)/1000;
            var message = `Returned ${res.length} triples in ${elapsed} seconds`;
            console.log(message);
            resolve(res);
        })
    })
}

module.exports = {
    queryEngine: function(query){
        return getTriples.then(triples => {
            return createStore().then(store => {
                //attach sources


                //load triples in store and return promise
                return loadTriplesInStore(store, triples).then(d => {
                    console.log(`Succesfully inserted ${d} triples in store`);
        
                    //Define prefix
                    store.setPrefix('bot', 'https://w3id.org/bot#');
                    store.registerDefaultProfileNamespaces();

                    return executeQuery(store, query);
                });
            })
        })
    },
    getTriples: function(){
        return getTriples;
    },
    sparqlJSON: function sparqlJSON(data){
        var vars = _.keysIn(data[0]);
        var bindings = _.map(data, triple => {
            return _.map(triple, el => {
                var type = el.token;
                var value = el.value;
                var obj = {type: type, value: value};
                if(el.type){
                    obj.datatype = el.type;
                }
                if(el.lang){
                    obj['xml:lang'] = el.lang;
                }
                return obj;
            });
        });
        var res = {head: {vars: vars}, results: {bindings: bindings}};
        return res;
    }
}