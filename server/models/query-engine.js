var rdfstore = require('rdfstore');
var Promise = require('bluebird');
var fs = require('fs');
var rename = require('rename');
var _ = require('lodash');
var prefixes = require('../../data/defaultPrefixes.json');

//Promisify callback functions
var readFile = Promise.promisify(fs.readFile);
var createStore = Promise.promisify(rdfstore.create);

// Variables
var path = 'data/triples.ttl'

var getTriples = readFile(path).then(buffer => buffer.toString());

// Function to load triples into an in-memory store
function loadTriplesInStore(store, triples){
    return new Promise((resolve, reject) => {
        store.load('text/turtle', triples, (err, res) => {
            if(err) reject(err);
            resolve(res);
        })
    })
}

// Function to execute a query
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
    addPrefixes: function(query){
        // Append all default prefixes from data/defaultPrefixes.json to the query
        pfx = '';
        _.each(prefixes, p => {
            pfx+= `PREFIX ${p.prefix}:\t<${p.uri}>\n`;
        })
        fullQuery = pfx+query;
        return fullQuery;
    },
    queryEngine: function(query){
        return getTriples.then(triples => {
            return createStore().then(store => {
                //load triples in store and return promise
                return loadTriplesInStore(store, triples).then(d => {        
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

        console.log(data);

        var map = {
            token : "type",

        };

        var vars = _.keysIn(data[0]);

        // Correct bindings by flattening the object array,
        // and renaming keys
        var b = _.flatMap(data);
        // bindings = []
        // for (var i in b) {
        //     var obj = rename(b[i], (key) => {
        //         if (key === 'type') return 'datatype';
        //         if (key === 'token') return 'type';
        //         if (key === 'lang') return 'xml:lang';
        //         return key;
        //     });
        //     bindings.push(obj);
        // }
        var res = {head: {vars: vars}, results: {bindings: b}};
        return res;
    }
}