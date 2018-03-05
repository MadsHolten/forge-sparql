var rdfstore = require('rdfstore');
var fs = require('fs');

var rdfp = {};

// Function to create store
rdfp.createStore = () => {
    return new Promise( (resolve, reject) => {
        rdfstore.create((err, store) => {
            if(err) reject(err);
            resolve(store);
        });
    })
}

// Function to load triples into an in-memory store
rdfp.loadTriplesInStore = (store, triples) => {
    return new Promise((resolve, reject) => {
        store.load('text/turtle', triples, (err, size) => {
            if(err) reject(err);
            var message = `Loaded ${size} triples in store`;
            console.log(message);
            resolve(size);
        })
    })
}

// Function to execute a query
rdfp.executeQuery = (store, query, accept) => {
    start = Date.now();
    return new Promise((resolve, reject) => {
        store.execute(query, (err, res) => {
            if(err) reject(err);

            end = Date.now();
            elapsed = (end-start)/1000;
            var message = `Returned ${res.length} triples in ${elapsed} seconds`;
            console.log(message);
            resolve(res);
        })
    })
}

// Function to load multiple triples in store
rdfp.loadMultiple = (store, paths) => {
    
    var promises = paths.map(path => {
        // If the string contains http, use the full address
        // If not, append data/ (then it's a local file)
        if(path.indexOf('http') === -1){
            path = 'data/'+path;
        }else{
            path = path;
        }

        // Return promise
        return new Promise((resolve, reject) => {
            // Read file content
            fs.readFile(path, 'utf8', (err, data) => {
                if(err){
                    resolve(err);
                }else{
                    resolve(data);
                }
            });
        });
    });

    // Load data in store
    return Promise.all(promises)
        .then(fileContent => {
            // Concatenate content of turtle-files
            triples = ''
            fileContent.forEach(data => {
                triples+=data+'\n';
            })

            return rdfp.loadTriplesInStore(store, triples);
        })

}

module.exports = rdfp;