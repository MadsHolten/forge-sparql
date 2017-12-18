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
    @Input() filePaths: string[];
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

    }

    // When changes in input data (urn, filePath)
    ngOnChanges(changes: SimpleChanges){
        if(typeof changes !== "undefined"){
            // URN changed?
            if(this.urn && typeof changes.urn !== "undefined" && changes.urn.currentValue){
                this.urn = changes.urn.currentValue;
            }
            // filePaths changed?
            if(this.filePaths && typeof changes.filePaths !== "undefined" && changes.filePaths.currentValue){
                this.filePaths = changes.filePaths.currentValue;
            }
        }
    }

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
        
    }

}