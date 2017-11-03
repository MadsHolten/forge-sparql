const express = require('express');
const ForgeSDK = require('forge-apis');

const AuthModel = require('../models/auth');

const CLIENT_ID = require('../config/forge-api').CLIENT_ID;
const CLIENT_SECRET = require('../config/forge-api').CLIENT_SECRET;

const router = express.Router();

//Get access token
router.get('/authenticate', (req, res, next) => {
  return AuthModel.authenticate(CLIENT_ID, CLIENT_SECRET)
          .then(d => res.send(d.credentials));
});

module.exports = router ;
