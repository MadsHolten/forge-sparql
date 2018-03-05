import * as _ from 'underscore';
import {MatSnackBar} from '@angular/material';

import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

//Services
import { TriplestoreService } from '../../services/triplestore.service';

export interface TestQuery {
  title: string;
  query: string;
}

@Component({
  selector: 'query-field',
  templateUrl: './query-field.component.html',
  styleUrls: ['./query-field.component.css'],
  providers: [TriplestoreService]
})

export class QueryFieldComponent {

  query: string = "SELECT ?s\nWHERE {\n\t?s a bot:Space .\n}";
  reasoning: boolean = false;

  // Tooltips
  toolTipReasoning: string = 'Perform reasoning to infer that for instance if "<S> a bot:Space" then "<S> a bot:Zone" or if "<A> bot:hasSpace <S>" then "<A> bot:containsZone <S>". Reasoning is performed by first saturating the graph based on the BOT ontology and performing this task reduces the performance slightly.';

  testQueries: TestQuery[] = [
    { 
      title: 'All elements with adjacency to a specific space',
      query: 'SELECT ?spaceName ?element\nWHERE {\n\t?space a bot:Space ;\n\t\trdfs:label ?spaceName ;\n\t\tbot:adjacentElement ?element .\n\tFILTER(?spaceName = "Room 2")\n}'
    },
    {
      title: 'All rooms from a Revit a model with both spaces and rooms',
      query: 'SELECT ?URI ?name\nWHERE {\n\t?URI a bot:Space ;\n\t\trdfs:label ?name .\n\tFILTER regex(str(?URI), "Rooms")\n}'
    },
    {
      title: 'All elements that are hosted by other elements',
      query: 'SELECT ?element ?name\nWHERE {\n\t?a bot:hostsElement ?element .\n\t?element rdfs:label ?name\n}'
    },
    {
      title: 'Rooms and their areas and volumes',
      query: 'PREFIX nir:\t<https://Niras.dk/XXXX#>\n\nSELECT ?room ?area ?volume\nWHERE {\n\t?s a bot:Space ;\n\t\trdfs:label ?room ;\n\t\tnir:space_area ?area ;\n\t\tnir:space_volumen ?volume .\n}'
    }
  ]

  @Input() filePaths: string[];
  @Output() queryResult = new EventEmitter<Object>();
  @Output() returnedURIs = new EventEmitter<string[]>();
  @Output() queryTime = new EventEmitter<number>();
  @Output() queryType = new EventEmitter<string>();

  constructor(
    private tss: TriplestoreService,
    public snackBar: MatSnackBar
  ) { }

  // When changes in input data (urn)
  ngOnChanges(changes: SimpleChanges){
      if(this.filePaths && changes.filePaths && changes.filePaths.currentValue){
          this.filePaths = changes.filePaths.currentValue;
      }
  }

  performQuery(){
    var start: any = new Date();
    var queryType = this.tss.getQuerytype(this.query);
    this.queryType.emit(queryType);
    
    this.tss.getQuery(this.query, this.reasoning, this.filePaths)
      .subscribe(res => {
        this.queryResult.emit(res);
        
        // Time elapsed
        var end: any = new Date();
        var timeDiff = (end-start)/1000; //time in seconds
        this.queryTime.emit(timeDiff);

        // Extract URIs for filtering
        var URIs = this.extractURIs(res);
        this.returnedURIs.emit(URIs);
      }, err => {
        if(err.error){
          this.showError(err.error);
        }
      });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 2000,
    });
  }

  clear(){
    this.queryResult.emit(null);
    this.returnedURIs.emit(null);
    this.query = "SELECT *\nWHERE {\n\tGRAPH ?g {\n\t\t?s ?p ?o .\n\t}\n}";
  }

  private extractURIs(data){
    if(!data){
      return null;
    }else if(data.results){
        return _.chain(data.results.bindings)
          .map(i => {
            return _.filter(i, j => {
              if(j.type == 'uri' || j.token == 'uri' && !j.value.startsWith("tag:/")){
                return true;
              }
              return false;
            })
          })
          .map(i => _.map(i, j => j.value))
          .flatten()
          .value();
    }
  }

}