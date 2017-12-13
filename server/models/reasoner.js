var Hylar = require('hylar');
var fs = require('fs');
h = new Hylar();

module.exports = {
    queryEngine: function(query){

        //Files and settings
        var mimeType = 'text/turtle';
        var files = [];
        files.push('data/triples.ttl');
        files.push('data/bot.ttl');

        //Get file content
        var triples = '';
        for(var i in files){
            var string = fs.readFileSync(files[i], "utf8").toString();
            if(i == 0){
                triples = string;
            }else{
                triples+='\n'+string;
            }
        }

        //Do reasoning and run query
        start = Date.now();
        return h.load(triples, mimeType)
        .then(response => {
            if(response){
                return h.query(query);
            }else{
                throw "Graph saturation failed.";
            }
        })
        .then(res => {
            end = Date.now();
            elapsed = (end-start)/1000;
            var message = `Returned ${res.length} triples in ${elapsed} seconds`;
            console.log(message);
            return res;
        });

    }
}