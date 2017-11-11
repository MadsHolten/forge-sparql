const express = require('express');
const qe = require('../models/query-engine');

const router = express.Router();

//SPARQL endpoint
//Get request
router.get('/', (req, res, next) => {
    var accept = req.headers.accept != '*/*' ? req.headers.accept : 'text/turtle'; //Default accept: turtle
    console.log(accept);
    if(req.query.sources){
        var sources = req.query.sources.split(',');
    }
    var query = req.query.query;
    console.log(query);
    console.log(sources);
    //Return it all for now
    qe.queryEngine(query,sources).then(qRes => {
        if(accept == 'application/json'){
            res.send(qe.sparqlJSON(qRes));
        }else if(accept == 'text/turtle'){
            res.send(qRes);
        }
        
    });
});

//SPARQL endpoint
//Post request
router.post('/', (req, res, next) => {
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