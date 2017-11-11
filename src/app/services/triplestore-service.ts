import { Injectable }   from '@angular/core';
import { Http, Response, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { HttpRequest, HttpClient }   from '@angular/common/http';

import * as _ from 'underscore';
import { Observable }   from 'rxjs/Observable';

import { ServicesConfig } from '../config/backends';

@Injectable()
export class TriplestoreService {
    private host = ServicesConfig.triplestoreURL
    private port = ServicesConfig.triplestorePort
    private baseURL = this.host+':'+this.port+'/endpoint';
    private acceptJSONLD; // Options to accept JSON-LD
    

    // Inject Http to private field
    constructor(
        private http: Http,
        private httpC: HttpClient
    ) { 
        let headers = new Headers({ 'Accept': 'application/ld+json' });
        let options = new RequestOptions({ headers: headers });
        this.acceptJSONLD = options;
    }

    //Get query
    public getQuery(db, query, queryType?) {
        // define headers
        var opts;
        if(queryType == 'select'){
            let headers = new Headers({ 'Accept': 'application/json' });
            let options = new RequestOptions({ headers: headers });
            opts = options;
        }else{
            opts = this.acceptJSONLD;
        }
        // define search parameters
        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('query', query);
        
        opts.search = urlSearchParams;
        return this.http
                .get(this.baseURL,opts)
                .map(res => res.json())
                .catch(this.handleError);
    }

    // Handle errors
    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
            console.error(errMsg);
            return Observable.throw(errMsg);
    }
}