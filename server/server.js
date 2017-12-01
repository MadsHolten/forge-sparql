const express = require('express');
const ForgeSDK = require('forge-apis');     //To communicate with the Forge API
const bodyParser = require('body-parser');  //For parsing request body
const cors = require('cors');               //Handles Cross Origin Resource Sharing
const rp = require('request-promise');      //NB! NOT USED
const config = require('../config.json')

var app = express();

//Routes
var authRoutes = require('./routes/auth');
var bucketRoutes = require('./routes/bucket');
var objectRoutes = require('./routes/object');
var endpointRoutes = require('./routes/endpoint');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); //Cross Origin Resource Sharing

//Either get port from environment variable or config file
app.set('port', (process.env.PORT || config.port));  

//Static files location
app.use(express.static('./dist'));
app.use(express.static('./data'));

/**
 * GET HOMEPAGE
 */
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

/**
 * ROUTES
 *
 * Authorization routes
 * GET      /authenticate           Get token
 */
app.use('/api', authRoutes);
/**
 * Bucket routes
 * GET      /buckets                Get all buckets
 * GET      /bucket/:key            Get bucket details
 * POST     /bucket                 Create a bucket
 * DELETE   /bucket/:key            Delete a bucket
 * GET      /bucket/:key/objects    Get all bucket objects
 * POST     /bucket/:key            Post file to bucket
 */
app.use('/api', bucketRoutes);
/**
 * Object routes
 * GET      /bucket/:bKey/object/:oKey              Get object details
 * GET      /bucket/:bKey/object/:oKey/metadata     Get model views
 * GET      /bucket/:bKey/object/:oKey/svf          Get bucket translation status
 * POST     /bucket/:bKey/object/:oKey/svf          Make SVF from object
 * DELETE   /bucket/:bKey/object/:oKey/manifest     Delete manifest (SVF and other converted files)
 * GET      /bucket/:bKey/object/:oKey/:guid        Get model view properties
 * DELETE   /bucket/:bKey/object/:oKey              Delete bucket
 */
app.use('/api', objectRoutes);
/**
 * SPARQL endpoint routes
 * GET      /endpoint               Do get query (query as URL parameters)
 * POST     /endpoint               Do get query (query as body element)
 */
app.use('/endpoint', endpointRoutes);

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
