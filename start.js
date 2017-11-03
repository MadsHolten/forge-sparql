//
// Copyright (c) Autodesk, Inc. All rights reserved 
//
// Node.js server Host
// by Cyrille Fauvel - Autodesk Developer Network (ADN)
// April 2015
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted, 
// provided that the above copyright notice appears in all copies and 
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting 
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS. 
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC. 
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//

// To avoid the EXDEV rename error, see http://stackoverflow.com/q/21071303/76173
process.env.TMPDIR ='uploads';
//process.env ['NODE_TLS_REJECT_UNAUTHORIZED'] ='0' ; // Ignore 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' authorization error

var app =require ('./server/server');

var server = app.listen(app.get ('port'), () => {
    console.log ('Server listening on port ' + server.address().port) ;
});