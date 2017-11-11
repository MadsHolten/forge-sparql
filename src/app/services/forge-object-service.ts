import { Injectable }   from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import * as _ from 'lodash';

import { Observable }   from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ServicesConfig } from '../config/backends';

@Injectable()
export class ForgeObjectService {
    private host = ServicesConfig.forgeBackendURL
    private port = ServicesConfig.forgeBackendPort
    private baseURL = this.host+':'+this.port;
    private objectURL = this.baseURL+'/api/bucket';
    private interval; //For interval requests

    // Inject Http to private field
    constructor(
        private http: Http
    ) { }

    public getModelViews(bucketKey, objectName) {
        const URL = this.objectURL+'/'+bucketKey+'/object/'+objectName+'/metadata';
        return this.http
                .get(URL)
                .map(res => res.json())
                .map(res => {
                    if(res.body && res.body.data){
                        return res.body.data.metadata;
                    }
                })
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