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
import { ForgeViewerService } from '../../services/forge-viewer.service';

import * as _ from 'underscore';
import * as copy from "copy-to-clipboard";

//Tell TS that Autodesk and THREE exists as a variable/object somewhere globally
declare const Autodesk: any;
declare const THREE: any;

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
  providers: [ ForgeAuthService, ForgeViewerService ]
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
    private fas: ForgeAuthService,
    private fvs: ForgeViewerService
  ) { }

  @Input() urn: string;
  @Input() filterByURIs: string[];
  @Output() selectedObject = new EventEmitter<Object>();
  @Output() selectedURI = new EventEmitter<Object>();

  // When initializing viewer
  ngOnInit() {
    this.indexViewable = 0; //Initialize to view 0
  }

  // When view is initialized
  ngAfterViewInit() {
    console.log(this.urn);
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
    if(this.urn && changes.urn && changes.urn.currentValue){
      this.urn = changes.urn.currentValue;
      this.refreshViewer();
    }
    if(this.filterByURIs && changes.filterByURIs && changes.filterByURIs.currentValue){
      var URIs = changes.filterByURIs.currentValue;
      console.log(URIs);

      // Generate promises for all URI searches
      var promises = [];
      for(var i in URIs){
        promises.push(this.fvs.findElementByURI(URIs[i],this.viewer));
      }

      // When all promises return
      Promise.all(promises)
        .then(d => {
          var ids = _.chain(d).flatten().uniq().value();
          console.log(ids);
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

    // Menus etc.
    this.addCopyURIItem()
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

  // Event when geometry selection has changed
  private selectionChanged(event: any) {
    const model = event.model;
    const dbIds = event.dbIdArray;

    // Get properties of object
    this.fvs.getProperties(dbIds[0],this.viewer).then(propData => {
      // Emit event
      this.selectedObject.emit(propData);
    });

    // Get URI
    this.fvs.findURIbyDbId(dbIds,this.viewer).then(d => {
      if(typeof d[0] !== 'undefined'){
        // Emit event
        this.selectedURI.emit(d[0].properties[0].displayValue);
      }
    })

  }

  // MODIFY MENUS ETC.

  // Add button to change color of the item
  private addChangeColorItem(){
    this.viewer.registerContextMenuCallback(  'MyChangingColorMenuItems', ( menu, status ) => {
        if( status.hasSelected ) {
            menu.push({
                title: 'Override color of selected elements to the red',
                target: () => {
                    const selSet = this.viewer.getSelection();
                    this.viewer.clearSelection();

                    const color = new THREE.Vector4( 255 / 255, 0, 0, 1 );
                    for( let i = 0; i < selSet.length; i++ ) {
                        this.viewer.setThemingColor( selSet[i], color );
                    }
                }
            });
        } else {
            menu.push({
                title: 'Clear overridden color',
                target: () => {
                    this.viewer.clearThemingColors();
                }
            });
        }
    });
  }

  // Add button to Add the URI of the selected element to the clipboard
  private addCopyURIItem(){
    this.viewer.registerContextMenuCallback(  'MyCopyURIMenuItems', ( menu, status ) => {
      menu.push({
          title: 'Copy URI to clipboard',
          target: () => {
              const selSet = this.viewer.getSelection();
              console.log(selSet);
              this.viewer.clearSelection();

              // Get URI
              this.fvs.findURIbyDbId(selSet,this.viewer).then(d => {
                if(typeof d[0] !== 'undefined'){
                  // Copy to clipboard
                  copy(d[0].properties[0].displayValue);
                }
              })
          }
      });
    });
  }

}