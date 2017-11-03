const ForgeSDK = require('forge-apis');

const CLIENT_ID = require('../config/forge-api').CLIENT_ID;
const CLIENT_SECRET = require('../config/forge-api').CLIENT_SECRET;

module.exports = {
  authenticate: function (CLIENT_ID, CLIENT_SECRET) {
    var result = {}
    // Initialize the 2-legged OAuth2 client, set specific scopes and optionally set the `autoRefresh` parameter to true
    // if you want the token to auto refresh
    var autoRefresh = true; // or false

    //OAuth settings (what access is granted for token?)
    var oAuth2TwoLegged = new ForgeSDK.AuthClientTwoLegged(CLIENT_ID, CLIENT_SECRET, [
        'data:read',
        'data:write',
        'bucket:create',
        'bucket:read',
        'bucket:delete',
        'data:write'
    ], autoRefresh);
    result.oAuth2TwoLegged = oAuth2TwoLegged;

    return oAuth2TwoLegged.authenticate()
        .then(credentials => {
            // The `credentials` object contains an access_token that is being used to call the endpoints.
            // In addition, this object is applied globally on the oAuth2TwoLegged client that you should use when calling secure endpoints.
            result.credentials = credentials;
            return result;
        }, err => {
            console.error(err);
            next(err);
        });
  }
}