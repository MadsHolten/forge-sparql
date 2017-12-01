import { Component, 
         ViewChild, 
         Input, 
         Output, 
         OnInit, 
         OnDestroy, 
         ElementRef, 
         EventEmitter, 
         OnChanges, 
         SimpleChanges } from '@angular/core';

import { ForgeAuthService } from '../../services/forge-auth.service';
import * as _ from 'underscore';

//Tell TS that Autodesk exists as a variable/object somewhere globally
declare const Autodesk: any;

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

@Component({
  selector: 'forge-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
  providers: [ ForgeAuthService ]
})

export class ForgeViewerComponent implements OnInit, OnDestroy {
  @ViewChild('viewerContainer') viewerContainer: any;
  viewer: any;        //Holds the div for the viewer
  toolbarControl: any; //Holds the toolbar control - from here buttons can be disabled
  lmvDoc: any;
  viewables: any;     //Holds the viewables ie. all geometry 2D/3D that can be rendered
  indexViewable: number; //Holds the index of the view to load

  constructor(
    private elementRef: ElementRef,
    private fas: ForgeAuthService
  ) { }

  @Input() urn: string;
  @Input() filterByURIs: string[];
  @Output() selectedObject = new EventEmitter<Object>();

  // When initializing viewer
  ngOnInit() {
    this.indexViewable = 0; //Initialize to view 0
  }

  // When view is initialized
  ngAfterViewInit() {
    this.launchViewer();
  }

  // When instance is destroyed
  ngOnDestroy() {
    if (this.viewer && this.viewer.running) {
      this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.selectionChanged);
      this.viewer.tearDown();
      this.viewer.finish();
      this.viewer = null;
    }
  }

  // When changes in input data
  ngOnChanges(changes: SimpleChanges){
    if(this.filterByURIs && changes.filterByURIs.currentValue){
      var URIs = changes.filterByURIs.currentValue;
      console.log(URIs);
      //Generate promises for all searches
      var promises = [];
      for(var i in URIs){
        promises.push(this.findElementByURI(URIs[i]));
      }
      //When all promises return
      Promise.all(promises)
        .then(d => {
          var ids = _.chain(d).flatten().uniq().value();
          this.viewer.isolateById(ids)

          /**COLORS NOT WORKING */
          // //load the extension 
          // this.viewer.loadExtension('Autodesk.ADN.Viewing.Extension.Color');
          // this.viewer.setColorMaterial(ids,0xff0000);
        })
    }
  }

  public refreshViewer() {
    if(this.viewer){
      this.viewer.tearDown();
      this.viewer.finish();
      this.viewer = null;
      this.launchViewer();
    }
  }

  private getAccessToken(onSuccess: any) {
    var token: Token = this.fas.retrieveToken();
    var accessToken = token.access_token;
    var expireTimeSeconds = token.expires_in;
    return onSuccess(accessToken, expireTimeSeconds);
  }

  private launchViewer() {
    if(this.viewer) {
      // Viewer has already been initialized
      return;
    }

    const options = {
      env: 'AutodeskProduction',
      getAccessToken: (onSuccess) => { this.getAccessToken(onSuccess) }
    };
    
    // this.viewer = new Autodesk.Viewing.Viewer3D(this.viewerContainer.nativeElement, {}); // Headless viewer
    // Viewer with UI
    this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer.nativeElement, {});
    
    // Check if the viewer has already been initialized
    // Ugly solution, but works
    if (!Autodesk.Viewing.Private.env) {
        Autodesk.Viewing.Initializer(options, () => {
            this.viewer.initialize();
            this.loadDocument();
        });
    } else {
      //give the initialized viewing application a tick to allow DOM element to be established before re-draw
      setTimeout(() => {
        this.viewer.initialize();
        this.loadDocument();
      });
    }
  }

  public loadDocument() {
    const urn = `urn:${this.urn}`;

    Autodesk.Viewing.Document.load(urn, (doc) => {
      //Get views to display in the viewer
      this.viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {type: 'geometry'}, true);
 
      if (this.viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
      }

      this.lmvDoc = doc;
      
      //Example of adding event listeners
      this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.geometryLoaded);
      this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged(event));
      
      //Load view into the viewer
      this.viewer.load(this.lmvDoc.getViewablePath(this.viewables[this.indexViewable]));
    }, errorMsg => console.error);
  }

  //Event when geometry is loaded
  private geometryLoaded(event: any) {
    const viewer = event.target;

    viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.geometryLoaded);

    //Example - set light preset and fit model to view
    viewer.setLightPreset(8);
    viewer.fitToView();
  }

  //Event when geometry has changed
  private selectionChanged(event: any) {
    const model = event.model;
    const dbIds = event.dbIdArray;

    //Get properties of object
    this.viewer.getProperties(dbIds[0], (props) => {
      //Emit event
      this.selectedObject.emit(props);
    })
  }

  private findElementByURI(URI){
    return new Promise((resolve, reject) => {
      this.viewer.search('"' + URI + '"', dbIDs => {
        // Spaces/rooms are handled differently
        if(!URI.includes('Space') && !URI.includes('Room')) resolve(dbIDs);
        else {
          // This is some workaround in order to return only elements. 
          // It is not the most correct approach and might break in the future
          var spaceID = _.filter(dbIDs, dbID => {
            //What properties are present on the node?
            this.getProperties(dbID).then(propData => {
              var pd: any = _.clone(propData);
              // Check if it is a room
              var findit = pd.properties.filter(item => { 
                  return (item.displayName === 'Type' 
                  && item.displayValue === 'Rooms'); 
              });
              if(findit.length > 0) resolve(dbID);
            })
          })
        }
      }, err => {
        reject(err);
      })
    });
  }

  private getProperties(dbid){
    return new Promise((resolve, reject) => {
      this.viewer.getProperties(dbid, res => resolve(res), err => reject(err))
    });
  }

}