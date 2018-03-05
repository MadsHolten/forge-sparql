import { Injectable }   from '@angular/core';
import { HttpClient, HttpHeaders }   from '@angular/common/http';

import 'rxjs/add/operator/map';

@Injectable()
export class TriplestoreService {

    private options;

    // Inject Http to private field
    constructor(
        private http: HttpClient
    ) { 
        // Make JSON-LD standard Accept format
        let header = new HttpHeaders().set('Accept', 'application/ld+json');
        this.options = { headers: header }
    }

    //Get query
    public getQuery(query, reasoning?, filePaths?) {
        // Change header if 'select' query requested
        var opts;

        // Get query type
        const queryType = this.getQuerytype(query);

        // Define headers
        let header = new HttpHeaders().set('Accept', 'application/json');
        this.options = { headers: header }

        // define search parameters
        this.options.params = {query: query}

        // perform reasoning?
        if(reasoning){
            this.options.params.reasoning = true;
        }

        // Source(s) specified?
        if(filePaths){
            // Convert to comma separated string and send as query parameter
            this.options.params.sources = filePaths.join();
        }
        
        return this.http.get('/endpoint', this.options);
    }

    public getQuerytype(query){
        // NB! Should maybe also support ASK and DESCRIBE
        // Get index of select and construct
        var selIndex = query.toLowerCase().indexOf('select');
        var consIndex = query.toLowerCase().indexOf('construct');
    
        // If both are found in the string, take the one with the lowest index
        // That means that we can still allow someone to for instance query for
        // a string that has "select" in it
        if(selIndex != -1 && consIndex !=-1){
          return selIndex < consIndex ? 'select' : 'construct';
        }
        if(selIndex != -1) return 'select';
        if(consIndex != -1) return 'construct';
        // If it is an insert query or something else return null
        return null;
    }

}