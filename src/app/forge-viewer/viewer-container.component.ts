import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

//Forge viewer
import { ForgeViewerComponent } from './viewer/forge-viewer.component';

import * as _ from 'lodash';

import { Observable }   from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';

//Services
import { ForgeObjectService } from '../services/forge-object-service';
import { TriplestoreService } from '../services/triplestore-service';

@Component({
    selector: 'viewer-container',
    templateUrl: './viewer-container.component.html',
    styleUrls: ['./viewer-container.component.scss'],
    providers: [ForgeObjectService, TriplestoreService]
})
export class ViewerContainerComponent implements OnInit {

    public viewables;

    @ViewChild('mainContentPane') mainContentPaneEl: ElementRef;
    @ViewChild(ForgeViewerComponent)
    private forgeViewer: ForgeViewerComponent;

    private bucketKey: string;
    private objectKey: string;
    public projectDB: string;
    private guid: string;
    public urn: string;
    public selectedURI;
    private interval;
    public queryResult: Object;     //holds the query result returned by the query field
    public filterByURIs: string[];  //holds the URIs contained in the query result returned by the query field
    public queryTime: number;       //holds the time it took to perform the query

    //UI
    private simpleToolbar: boolean;

    constructor(
        private fos: ForgeObjectService,
        private tss: TriplestoreService
      ) { }

    ngOnInit() {
        this.getModelDetails();
    }

    ngAfterViewInit() {
        let fv = this.forgeViewer;
        this.viewables = fv.viewables;
        //Bad approach!
        setTimeout( () => {
            this.viewables = fv.viewables;
        },3000)
    }

    ngOnDestroy() {
        clearInterval(this.interval); //Stop monitoring for model properties
    }

    private getModelDetails() {
        //NB! should be retrieved through router module in a full implementation
        this.bucketKey = 'niras_p101101';
        this.objectKey = 'testprojekt_URIs.nwc';
        this.projectDB = 'P'+this.bucketKey.split('p')[1];
        this.getObectGUID();

        var objectId: string = 'urn:adsk.objects:os.object:'+encodeURI(this.bucketKey)+'/'+encodeURI(this.objectKey);
        this.urn = btoa(objectId).split('=')[0];
    }

    getObectGUID(){
        this.fos.getModelViews(this.bucketKey, this.objectKey)
            .subscribe(res => {
                this.guid = res[0].guid;
            }, err => {
            console.log(err);
            });
    }

    private queryTS() {
        const db = 'P'+this.bucketKey.split('p')[1];
        const URI = this.selectedURI;
        const q =  `CONSTRUCT {
                        ?something ?p ?subject .
                        ?subject ?key ?value .
                    } WHERE { GRAPH ?g {
                        BIND(<${URI}> AS ?subject) 
                        ?subject ?key ?value .
                        ?something ?p ?subject . } 
                    }`;
        this.tss.getQuery(db, q)
            .subscribe(res => {
                console.log(res);
            }, err => {
                console.log(err);
            });
    }

    onHChange() {
        //emitted after horizontal view change
        console.log("Changed H pane");
        this.forgeViewer.refreshViewer();
    }

    onVChange() {
        //emitted after horizontal view change
        console.log("Changed V pane");
    }

    log(ev){
        console.log(ev);
    }

}