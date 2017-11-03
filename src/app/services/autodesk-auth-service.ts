import { Injectable }   from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import * as ForgeSDK from 'forge-apis';

import { Observable }   from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ServicesConfig } from './config';

@Injectable()
export class AutodeskAuthService {
    private host = ServicesConfig.forgeBackendURL
    private port = ServicesConfig.forgeBackendPort
    private baseURL = this.host+':'+this.port;
    private authURL = this.baseURL+'/api/authenticate';
    
    private tokenKey:string = 'app_token';

    // Inject Http to private field
    constructor(private http: Http) { }

    private store(content:Object) {
        localStorage.setItem(this.tokenKey, JSON.stringify(content));
    }

    private retrieve() {
        return localStorage.getItem(this.tokenKey);
    }

    public generateNewToken() {
	console.log(this.authURL);
        return this.http
            .get(this.authURL)
            .map(res => res.json())
            .map(token => {
                let currentTime:number = (new Date()).getTime()/1000;
                let tokenExpire:number = currentTime+token.expires_in;
                this.store({tokenExpire: tokenExpire, token});
                return {tokenExpire: tokenExpire, token};
            })
            .catch(this.handleError);
    }

    public retrieveToken() {
        var token:any = '';
        try {
            let currentTime:number = (new Date()).getTime()/1000;
            let storedToken = JSON.parse(this.retrieve());
            let expires = Math.floor(storedToken.tokenExpire-currentTime);
            if(expires < 0){
                console.log('Token has expired. Getting a new one');
                return this.generateNewToken()
                            .subscribe(d => {
                                return token = d;
                            }, err => {
                                console.log(err);
                            })
            }else {
                console.log('Token still valid for '+expires+' seconds.');
                token = storedToken.token;
		console.log(token);
                return token;
            }
        }
        catch(err) {
            console.error(err);
	    return this.generateNewToken()
                .subscribe(d => {
                    return token = d;
                }, err => {
                    console.log(err);
                })
        }
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
