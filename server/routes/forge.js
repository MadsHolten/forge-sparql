const express = require('express');
const ForgeSDK = require('forge-apis');
const base64url = require('base64url');
const AuthModel = require('../models/auth');

const CLIENT_ID = require('../config/forge-api').CLIENT_ID;
const CLIENT_SECRET = require('../config/forge-api').CLIENT_SECRET;

var derivativesApi = new ForgeSDK.DerivativesApi();
var objectsApi = new ForgeSDK.ObjectsApi();

const router = express.Router();

//Get file translation status
router.get('/modelViewProperties/:urn', (req, res, next) => {
    var urn = req.params.urn;
    var oAuth2TwoLegged = '';
    var credentials = '';
    AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
            .then(auth => {
                oAuth2TwoLegged = auth.oAuth2TwoLegged;
                credentials = auth.credentials;
                return derivativesApi.getMetadata(urn, {}, oAuth2TwoLegged, credentials)
                    .then(d => {
                        // Extract guid from model
                        guid = d.body.data.metadata[0].guid;
                        // Get model view tree
                        return derivativesApi.getModelviewProperties(urn, guid, {}, oAuth2TwoLegged, credentials);
                    })
                    .then(d => {
                        res.send(d);
                    })
                    .catch(err => next(err));
            });
    
});

module.exports = router ;