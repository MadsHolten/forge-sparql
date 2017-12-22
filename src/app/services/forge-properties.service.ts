import { Injectable }   from '@angular/core';
import { HttpClient, HttpHeaders }   from '@angular/common/http';

@Injectable()
export class ForgePropertiesService {

    // Inject Http to private field
    constructor(
        private http: HttpClient
    ) { }

    public getProperties(urn){
        return this.http.get('/api/modelViewProperties/'+urn);
    }

}