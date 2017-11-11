const express = require('express');
var app = express();

app.set('port', (process.env.PORT || 3001));

//Static files location
app.use(express.static(__dirname + '/static'));

//SPARQL endpoint
//Query route
app.get('/endpoint', (req, res) => {
    var accept = req.headers.accept != '*/*' ? req.headers.accept : 'text/turtle'; //Default accept: turtle
    var query = req.query.query;
    if(!query){
        res.send('Hej')
    }
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