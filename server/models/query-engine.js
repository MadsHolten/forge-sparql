const rdfp = require('./rdfstore-promises'); //rdfstore promises
var _ = require('lodash');
var prefixes = require('../../data/defaultPrefixes.json');

// Default path
var path = 'triples.ttl';

// PUBLIC METHODS
var qe = {};

qe.addPrefixes = (query) => {
    // Append all default prefixes from data/defaultPrefixes.json to the query
    pfx = '';
    _.each(prefixes, p => {
        pfx+= `PREFIX ${p.prefix}:\t<${p.uri}>\n`;
    })
    fullQuery = pfx+query;
    return fullQuery;
}

qe.queryEngine = async (query,sources) => {
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

    // Create a store
    var store = await rdfp.createStore();

    // load triples in store
    await rdfp.loadMultiple(store,paths);

    // Execute query on data
    var res = await rdfp.executeQuery(store, query);

    return res;
}

qe.getTriples = () => {
    return getTriples;
}

qe.getQuerytype = (query) => {
    // Get index of select and construct
    var selIndex = query.toLowerCase().indexOf('select');
    var consIndex = query.toLowerCase().indexOf('construct');

    // If both are found in the string, take the one with the lowest index
    // That means that we can still allow someone to for instance query for
    // a string that has "select" in it
    if(selIndex != -1 && consIndex !=-1){
      return selIndex < consIndex ? 'select' : 'construct';
    }
    if(selIndex != -1) return 'select';
    if(consIndex != -1) return 'construct';
    // If it is an insert query or something else return null
    return null;
}

qe.sparqlJSON = (data) => {
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

module.exports = qe;

// PRIVATE METHODS
function renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map(key => {
        const newKey = newKeys[key] || key;
        return { [newKey]: obj[key] };
    });
    return Object.assign({}, ...keyValues);
}