import { Component, ViewChild, ElementRef, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';

// Forge viewer
// import { ForgeViewerComponent } from './viewer/forge-viewer.component';

// Services
import { TriplestoreService } from '../services/triplestore.service';



@Component({
    selector: 'viewer-container',
    templateUrl: './viewer-container.component.html',
    styleUrls: ['./viewer-container.component.css'],
    providers: [ TriplestoreService ]
})
export class ViewerContainerComponent implements OnInit {

    @Input() urn: string;
    @ViewChild('mainContentPane') mainContentPaneEl: ElementRef;

    // Parameters returned from query field
    public queryResult: Object;     //holds the query result returned by the query field
    public filterByURIs: string[];  //holds the URIs contained in the query result returned by the query field
    public queryTime: number;       //holds the time it took to perform the query

    // Parameters retrieved from Forge API
    private bucketKey;
    private objectKey;

    constructor(
        private tss: TriplestoreService
      ) { }

    ngOnInit() {
        //NB! should be retrieved through router module in a full implementation
        // this.bucketKey = 'niras_p101101';
        // this.objectKey = 'testprojekt_URIs.nwc';
        // this.getModelDetails();
        // console.log("urn: "+this.urn)
    }

    // When changes in input data (urn)
    ngOnChanges(changes: SimpleChanges){
        if(this.urn && changes.urn.currentValue){
            this.urn = changes.urn.currentValue;
        }
    }

    // private getModelDetails() {
    //     // this.getObectGUID();
    //     var objectId: string = 'urn:adsk.objects:os.object:'+encodeURI(this.bucketKey)+'/'+encodeURI(this.objectKey);
    //     this.urn = btoa(objectId).split('=')[0];
    //     console.log(this.urn)
    // }

    onHChange() {
        //emitted after horizontal view change
        console.log("Changed H pane");
        // this.forgeViewer.refreshViewer();
    }

    onVChange() {
        //emitted after horizontal view change
        console.log("Changed V pane");
    }

    log(ev){
        console.log(ev);
    }

}