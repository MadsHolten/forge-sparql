import { Injectable }   from '@angular/core';
import { HttpClient, HttpHeaders }   from '@angular/common/http';

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
    public getQuery(query, queryType?, reasoning?, filePaths?) {
        // Change header if 'select' query requested
        var opts;
        if(queryType == 'select'){
            let header = new HttpHeaders().set('Accept', 'application/json');
            this.options = { headers: header }
        }

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
        
        return this.http.get('http://localhost:3000/endpoint', this.options);
    }

}