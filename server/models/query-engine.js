var rdfstore = require('rdfstore');
var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');
var prefixes = require('../../data/defaultPrefixes.json');

// Default path
var path = 'triples.ttl';

//Promisify callback functions
var readFile = Promise.promisify(fs.readFile);
var createStore = Promise.promisify(rdfstore.create);

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

// Function to load multiple triples in store
function loadMultiple(store,paths){
    var fileReads = [];
    for(var i in paths){
        // If the string contains http, use the full address
        // If not, append data/ (then it's a local file)
        if(paths[i].indexOf('http') === -1){
            var path = 'data/'+paths[i];
        }else{
            var path = paths[i];
        }
        var getTriples = readFile(path)
            .then(buffer => buffer.toString())
            .then(triples => loadTriplesInStore(store, triples));
        fileReads.push(getTriples);
    }
    return Promise.all(fileReads);
}

function renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map(key => {
        const newKey = newKeys[key] || key;
        return { [newKey]: obj[key] };
    });
    return Object.assign({}, ...keyValues);
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
    queryEngine: function(query,sources){
        // If sources is undefined, use default
        if(typeof sources === "undefined") {
            var paths = [path];
        }
        // If sources is a string, append it to an array
        else if(typeof sources === "string"){
            var paths = [sources];
        }
        // Else, just use them as they are
        else{
            var paths = sources;
        }

        var store;

        // Create a store
        return createStore()
            .then(store => {
                // Assign store to variable
                this.store = store;
                // load triples in store and return promise
                return loadMultiple(store,paths)
            })
            .then(() => {
                // When data is loaded in store, execute query on it
                return executeQuery(this.store, query);
            });
    },
    getTriples: function(){
        return getTriples;
    },
    sparqlJSON: function sparqlJSON(data){
        // Get variable keys
        var vars = _.keysIn(data[0]);
        
        // check that it doesn't return null results
        if(data[0][vars[0]] == null){
            return {status: 400, data: "Query returned no results"};
        }

        // Flatten object array
        var b = _.flatMap(data);

        // Rename keys according to below mapping table
        var map = {
            token: "type",
            type: "datatype",
            lang: "xml:lang"
        };

        // Loop over data to rename the keys
        for(var i in b){
            for(var key in vars){
                b[i][vars[key]] = renameKeys(b[i][vars[key]], map)
            }
        }

        // Re-format data
        var data = {head: {vars: vars}, results: {bindings: b}};

        return {status: 200, data: data};
    }
}