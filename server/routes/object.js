const express = require('express');
const ForgeSDK = require('forge-apis');
const base64url = require('base64url');
const AuthModel = require('../models/auth');

const CLIENT_ID = require('../config/forge-api').CLIENT_ID;
const CLIENT_SECRET = require('../config/forge-api').CLIENT_SECRET;

var derivativesApi = new ForgeSDK.DerivativesApi();
var objectsApi = new ForgeSDK.ObjectsApi();

const router = express.Router();

//Get object details
router.get('/bucket/:bKey/object/:oKey', (req, res, next) => {
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                var oAuth2TwoLegged = auth.oAuth2TwoLegged;
                var credentials = auth.credentials;
                return objectsApi.getObjectDetails(encodeURI(bKey), encodeURI(oKey), {}, oAuth2TwoLegged, credentials)
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            })
});

//Get model views
router.get('/bucket/:bKey/object/:oKey/metadata', (req, res, next) => {
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    var oId = 'urn:adsk.objects:os.object:'+encodeURI(bKey)+'/'+encodeURI(oKey);
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                var oAuth2TwoLegged = auth.oAuth2TwoLegged;
                var credentials = auth.credentials;
                return derivativesApi.getMetadata(base64url(oId), {}, oAuth2TwoLegged, credentials)
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            })
})

//Get file translation status
router.get('/bucket/:bKey/object/:oKey/svf', (req, res, next) => {
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    var oId = 'urn:adsk.objects:os.object:'+encodeURI(bKey)+'/'+encodeURI(oKey);
    var oAuth2TwoLegged = '';
    var credentials = '';
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                oAuth2TwoLegged = auth.oAuth2TwoLegged;
                credentials = auth.credentials;
                return derivativesApi.getManifest(base64url(oId), {}, oAuth2TwoLegged, credentials)
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            });
    
});

//Make SVF from object
router.post('/bucket/:bKey/object/:oKey/svf', (req, res, next) => {
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    var oId = 'urn:adsk.objects:os.object:'+encodeURI(bKey)+'/'+encodeURI(oKey);

    var oAuth2TwoLegged = '';
    var credentials = '';
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                oAuth2TwoLegged = auth.oAuth2TwoLegged;
                credentials = auth.credentials;
                var input = {
                    urn: base64url(oId),
                    compressedUrn: false,
					rootFilename: oKey
                };
                var output = {formats: [{type: 'svf', views: ['2d', '3d']}]};
                var job = {input: input, output: output};
                var opts = { 'xAdsForce': true }; //replace previously translated
                console.log(JSON.stringify(job));
                return derivativesApi.translate(job, opts, oAuth2TwoLegged, credentials)
                    .then(d => {
                        console.log("Translating");
                        console.log(JSON.stringify(d));
                        res.send(d);
                    })
                    .catch(err => next(err));
            })
            .catch(err => next(err));
});

//Delete manifest (the mainfest + its translated output files (derivatives) will be deleted - not the source file)
router.delete('/bucket/:bKey/object/:oKey/manifest', (req, res, next) => {
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    var oId = 'urn:adsk.objects:os.object:'+encodeURI(bKey)+'/'+encodeURI(oKey);
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                return derivativesApi.deleteManifest(base64url(oId), oAuth2TwoLegged, credentials)
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            })
});

//Get model view properties
router.get('/bucket/:bKey/object/:oKey/:guid/properties', (req, res, next) => {
    var guid = req.params.guid;
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    var oId = 'urn:adsk.objects:os.object:'+encodeURI(bKey)+'/'+encodeURI(oKey);
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                var oAuth2TwoLegged = auth.oAuth2TwoLegged;
                var credentials = auth.credentials;
                return derivativesApi.getModelviewProperties(base64url(oId), guid, {}, oAuth2TwoLegged, credentials)
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            })
});

//Get model view tree
router.get('/bucket/:bKey/object/:oKey/:guid/tree', (req, res, next) => {
    var guid = req.params.guid;
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    var oId = 'urn:adsk.objects:os.object:'+encodeURI(bKey)+'/'+encodeURI(oKey);
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                var oAuth2TwoLegged = auth.oAuth2TwoLegged;
                var credentials = auth.credentials;
                return derivativesApi.getModelviewMetadata(base64url(oId), guid, {}, oAuth2TwoLegged, credentials)
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            })
});

//Delete object
router.delete('/bucket/:bKey/object/:oKey', (req, res, next) => {
    var bKey = req.params.bKey;
    var oKey = req.params.oKey;
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                var oAuth2TwoLegged = auth.oAuth2TwoLegged;
                var credentials = auth.credentials;
                return objectsApi.deleteObject(encodeURI(bKey), encodeURI(oKey), oAuth2TwoLegged, credentials)
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            })
});

module.exports = router ;