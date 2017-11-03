import * as _ from 'underscore';

import { Component, Input, EventEmitter, Output } from '@angular/core';

//Services
import { TriplestoreService } from '../../services/triplestore-service';

export interface TestQuery {
  title: string;
  query: string;
}

@Component({
  selector: 'query-field',
  templateUrl: './query-field.component.html',
  styleUrls: ['./query-field.component.scss'],
  providers: [TriplestoreService]
})

export class QueryFieldComponent {

  query: string = "SELECT ?s\nWHERE {\n\tGRAPH ?g {\n\t\t?s a bot:Space .\n\t}\n}";
  reasoning: boolean = false;

  testQueries: TestQuery[] = [
    { 
      title: 'All elements with adjacency to a specific space',
      query: 'SELECT ?spaceName ?element\nWHERE {\n\tGRAPH ?g {\n\t\t?space a bot:Space ;\n\t\t\trdfs:label ?spaceName ;\n\t\t\tbot:adjacentElement ?element .\n\t\tFILTER(?spaceName = "Room 2")\n\t}\n}'
    },
    {
      title: 'All rooms from a Revit a model with both spaces and rooms',
      query: 'SELECT ?URI ?name\nWHERE {\n\tGRAPH ?g {\n\t\t?URI a bot:Space ;\n\t\t\trdfs:label ?name .\n\t\tFILTER regex(str(?URI), "Rooms")\n\t}\n}'
    },
    {
      title: 'All elements that are hosted by other elements',
      query: 'SELECT ?element ?name\nWHERE {\n\tGRAPH ?g {\n\t\t?a bot:hostsElement ?element .\n\t\t?element rdfs:label ?name\n\t}\n}'
    },
    {
      title: 'Rooms and their areas and volumes',
      query: 'PREFIX nir:\t<https://Niras.dk/XXXX#>\n\nSELECT ?room ?area ?volume\nWHERE {\n\tGRAPH ?g {\n\t\t?s a bot:Space ;\n\t\t\trdfs:label ?room ;\n\t\t\tnir:space_area ?area ;\n\t\t\tnir:space_volumen ?volume .\n\t}\n}'
    }
  ]

  @Input() projectDB: string;
  @Output() queryResult = new EventEmitter<Object>();
  @Output() returnedURIs = new EventEmitter<string[]>();
  @Output() queryTime = new EventEmitter<number>();

  constructor(
    private tss: TriplestoreService
  ) { }

  performQuery(){
    var start: any = new Date();
    this.tss.getQuery(this.projectDB, this.query, 'select')
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
        console.log(err);
      });
  }

  clear(){
    this.queryResult.emit(null);
    this.returnedURIs.emit(null);
    this.query = "SELECT *\nWHERE {\n\tGRAPH ?g {\n\t\t?s ?p ?o .\n\t}\n}";
  }

  private extractURIs(data){
    return _.chain(data.results.bindings)
                    .map(i => {
                      return _.filter(i, j => {
                        if(j.type == 'uri' && !j.value.startsWith("tag:/")){
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
