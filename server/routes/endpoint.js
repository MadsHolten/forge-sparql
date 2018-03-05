const express = require('express');
const queryEngine = require('../models/query-engine');
const reasoner = require('../models/reasoner');
const _ = require('lodash');

const router = express.Router();

// SPARQL endpoint
// Get request
router.get('/', (req, res, next) => {

    // variable to hold result
    var result = '';

    // Get accept header
    // If none recieved, default to turtle
    var accept = req.headers.accept != '*/*' ? req.headers.accept : 'text/turtle'; //Default accept: turtle

    // WIP: Should be used to alow the user to choose
    // what triple file to query from
    if(req.query.sources){
        var sources = req.query.sources.split(',');
    }

    // Get query
    var query = req.query.query;

    // Add default prefixes
    query = queryEngine.addPrefixes(query);

    // Reasoning? (defaults to false)
    var reasoning = req.query.reasoning ? req.query.reasoning : false;

    if(!reasoning){
        // Perform query without reasoning
        queryEngine.queryEngine(query,sources).then(qRes => {
            return sendResult(qRes);
        }).catch(err => {
            res.status(500).send(err);
        })
    } else {
        // Perform query with reasoning
        reasoner.queryEngine(query,sources).then(qRes => {
            return sendResult(qRes);
        }).catch(err => {
            console.log(err);
            res.status(500).send(err);
        })
    }

    // Return result as either turtle or JSON
    var sendResult = (result) => {
        if(accept == 'application/json' || accept == 'application/sparql-results+json'){
            res.set('Content-Type', 'application/sparql-results+json');

            // Format
            var queryType = queryEngine.getQuerytype(query);

            if(queryType == 'select'){
                var formatted = queryEngine.sparqlJSON(result);
            }else{
                var data = _.map(result.triples, x => _.mapValues(x, y => y.nominalValue));
                var formatted = {data: data, status: 200};
            }

            res.status(formatted.status).send(formatted.data);
        }else if(accept == 'text/turtle'){
            res.set('Content-Type', 'text/turtle');
            res.send(result);
        }
    }

});

//UPDATE endpoint
//Post request
router.post('/update', (req, res, next) => {
    if(req.body && req.body.query){
        var query = req.body.query;
    }else{
        var query = req.query.query;
    }
    if(!query) {
        res.status(400).send('Please specify a query');
        return;
    }
    qe.queryEngine(query).then(qRes => res.send(qRes));
});

module.exports = router ;