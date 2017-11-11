const express = require('express');
const bodyParser = require('body-parser');  //For parsing request body
var app = express();

const qe = require('./query-engine');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 3000));

//Static files location
app.use(express.static(__dirname + '/static'));

//Query route
app.post('/endpoint', (req, res) => {
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

//SPARQL endpoint
//Query route
app.get('/endpoint', (req, res) => {
    var accept = req.headers.accept != '*/*' ? req.headers.accept : 'text/turtle'; //Default accept: turtle
    var sources = req.query.sources.split(',');
    var query = req.query.query;
    console.log(query);
    console.log(sources);
    //Return it all for now
    qe.queryEngine(query).then(qRes => {
        if(accept == 'application/json'){
            res.send(qe.sparqlJSON(qRes));
        }else if(accept == 'text/turtle'){
            res.send(qRes);
        }
        
    });
});

//Handle errors
app.use((err, req, res, next) => {
    if(!err){
        err = 'Something broke!';
    }
    res.send(err);
});

app.listen(app.get('port'), () => {
    console.log('app running on port', app.get('port'));
});