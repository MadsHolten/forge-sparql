import { Injectable }   from '@angular/core';
import { HttpClient, HttpHeaders }   from '@angular/common/http';

import 'rxjs/add/operator/map';

// Interfaces
export interface Token {
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: string;
}

@Injectable()
export class ForgeAuthService {

    private tokenKey:string = 'app_token';

    // Inject Http to private field
    constructor(
        private http: HttpClient
    ) { }

    private store(content:Object) {
        localStorage.setItem(this.tokenKey, JSON.stringify(content));
    }

    private retrieve() {
        return localStorage.getItem(this.tokenKey);
    }

    public generateNewToken() {
        return this.http
            .get('/api/authenticate')
            .map((token: Token) => {
                let currentTime:number = (new Date()).getTime()/1000;
                let tokenExpire:number = currentTime+token.expires_in;
                this.store({tokenExpire: tokenExpire, token});
                return {tokenExpire: tokenExpire, token};
            });
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

}