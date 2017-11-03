const express = require('express');
const ForgeSDK = require('forge-apis');
const multer = require('multer'); //Handles file uploads
const fs = require('fs');
const _ = require('lodash');

const AuthModel = require('../models/auth');

const CLIENT_ID = require('../config/forge-api').CLIENT_ID;
const CLIENT_SECRET = require('../config/forge-api').CLIENT_SECRET;

const objectsApi = new ForgeSDK.ObjectsApi();
const bucketsApi = new ForgeSDK.BucketsApi();

const router = express.Router();

var upload = multer({
    dest: 'uploads/',
    fileFilter: fileFilter
}).single('model');

//File type filter
function fileFilter(req, file, cb){
    console.log(JSON.stringify(file));
    var patt = /\.[0-9a-z]+$/i;
    var extension = String(file.originalname.match(patt));
    var okExt = ['.ifc', '.rvt', '.skp', '.nwc'];
    var okMT = ['application/octet-stream', 'skp'];
    //Only allow binary files
    if(!okMT.includes(_.toLower(file.mimetype))){
        return cb(new Error('Invalid file format'), false);
    }else if(!okExt.includes(_.toLower(extension))){
        return cb(new Error('Invalid file extension'), false);
    }
    cb(null, true);
};

//Get buckets
router.get('/buckets', (req, res, next) => {

    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(d => {
                var oAuth2TwoLegged = d.oAuth2TwoLegged;
                var credentials = d.credentials;
                return bucketsApi.getBuckets({}, oAuth2TwoLegged, credentials);
            })
            .then(buckets => {
                res.send(buckets);
            })
            .catch(err => {
                next(err);
            });
});

//Get bucket details
router.get('/bucket/:key', (req, res, next) => {
    var bKey = req.params.key;

    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(d => {
                var oAuth2TwoLegged = d.oAuth2TwoLegged;
                var credentials = d.credentials;
                return bucketsApi.getBucketDetails(encodeURI(bKey), oAuth2TwoLegged, credentials);
            })
            .then(details => {
                res.send(details);
            })
            .catch(err => {
                next(err);
            });
});

//Add bucket
router.post('/bucket', (req, res, next) => {

    const bucketKey = req.body.bucketKey;
    const policyKey = req.body.policyKey ? req.body.policyKey : 'transient';

    //Undefined variables
    var oAuth2TwoLegged;
    var credentials;

    var postBuckets = {
        bucketKey: bucketKey,
        policyKey: policyKey
    }

    var opts = {
        'x-ads-region': 'EMEA'
    }

    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(d => {
                console.log(postBuckets);
                //Create bucket
                oAuth2TwoLegged = d.oAuth2TwoLegged;
                credentials = d.credentials;
                return bucketsApi.createBucket(postBuckets, opts, oAuth2TwoLegged, credentials);
            })
            .then(bucket => {
                var bucketKey = bucket.body.bucketKey;
                console.log("Successfully created bucket "+bucketKey);
                //Get bucket details
                return bucketsApi.getBucketDetails(encodeURI(bKey), oAuth2TwoLegged, credentials);
            })
            .then(details => {
                res.send(details);
            })
            .catch(err => {
                next(err);
            })
});

//Delete bucket
router.delete('/bucket/:key', (req, res, next) => {
    const bucketName = req.params.key;

    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(d => {
                //Delete bucket
                oAuth2TwoLegged = d.oAuth2TwoLegged;
                credentials = d.credentials;
                return bucketsApi.deleteBucket(encodeURI(bucketName), oAuth2TwoLegged, credentials);
            })
            .then(d => {
                res.send(d);
            })
            .catch(err => {
                next(err);
            })
});

/**
 * OBJECTS
 */

//Get bucket objects
router.get('/bucket/:key/objects', (req, res, next) => {
    var bKey = req.params.key;

    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(d => {
                var oAuth2TwoLegged = d.oAuth2TwoLegged;
                var credentials = d.credentials;
                return objectsApi.getObjects(encodeURI(bKey), {}, oAuth2TwoLegged, credentials);
            })
            .then(details => {
                res.send(details);
            })
            .catch(err => {
                next(err);
            });
});

//Post file to bucket
router.post('/bucket/:key', (req, res, next) => {
    const bucketName = req.params.key;
    var objectName = '';
    var path = '';
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
            return res.status(422).send("File upload failed");
        }
        //Store metadata
        path = 'uploads/'+req.file.filename;
        objectName = req.file.originalname.replace(' ', '_'); //No underscores allowed;
        console.log(objectName);
        return new Promise((resolve, reject) => resolve(path))
                .then(path => {
                    //Authenticate
                    return AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
                })
                .then(auth => {
                    //Copy file to bucket
                    var opts = {};
                    oAuth2TwoLegged = auth.oAuth2TwoLegged;
                    credentials = auth.credentials;
                    return fs.readFile(path, (err, data) => {
                        if(err){
                            console.log(err);
                            next(err); 
                        }else{
                            return objectsApi.uploadObject(encodeURI(bucketName), encodeURI(objectName), data.length, data, opts, oAuth2TwoLegged, credentials)
                                    .then(obj => {
                                        //Delete file
                                        fs.unlink(path, (err) => {
                                            console.log(err);
                                            next(err); 
                                        })
                                        console.log(obj);
                                        res.send(obj);
                                    })
                                    .catch(err => {
                                        next(err);
                                        //Delete file
                                        fs.unlink(path, (err) => {
                                            console.log(err);
                                            next(err); 
                                        })
                                    });
                        }
                    });
                })
        });
});

module.exports = router ;