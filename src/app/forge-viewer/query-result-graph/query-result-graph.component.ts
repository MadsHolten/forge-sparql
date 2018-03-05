import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import * as N3 from 'n3';
import * as _ from 'lodash';
import * as screenfull from 'screenfull';
import * as d3_save_svg from 'd3-save-svg';

//Tell TS D3 exists as a variable/object somewhere globally
declare const d3: any;

export interface Node {
  id: string;
  label: string;
  weight: number;
  type: string;
  owlClass?: boolean;
  instance?: boolean;
  //instSpace?: boolean; //MB
  //instSpaceType?: boolean; //MB
}

export interface Link {
  source: Node;
  target: Node;
  predicate: string;
  weight: number;
}

export interface Triples {
  s: Node;
  p: Node;
  o: Node;
}

export interface Graph {
  nodes: Node[];
  links: Link[];
  triples: Triples[];
}

@Component({
  selector: 'query-result-graph',
  templateUrl: './query-result-graph.component.html',
  styleUrls: ['./query-result-graph.component.css']
})

export class QueryResultGraphComponent implements OnInit, OnDestroy {

  private graph: Graph;
  private svg;
  private force;
  public fs: boolean = false;  //Fullscreen on?

  private divWidth;
  private divHeight;
  private widthBeforeResize;

  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  @Input() public height: number;
  @Input() public queryTime: number;
  // @Input() private width: number;
  
  constructor() { }

  ngOnInit() {
    if(this.data){
      // set initial height
      if(this.height){
        this.divHeight = this.height;
      }else{
        this.divHeight = 500; //default to 500px
      }
      this.createChart();
    }
  }

  fullscreen(){
    this.fs = this.fs ? false : true;
    var el = this.chartContainer.nativeElement;

    //Record initial screen width when changing to fullscreen
    if(this.fs) this.widthBeforeResize = el.clientWidth;    

    if (screenfull.enabled) {
      screenfull.toggle(el);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data.currentValue) {
      this.data = changes.data.currentValue;

      this.cleanGraph();
      this.attachData();
    }
  }

  // When instance is destroyed
  ngOnDestroy() {
    d3.selectAll("svg").remove();
  }

  // Redraw on resize
  @HostListener('window:resize') onResize() {
    var el = this.chartContainer.nativeElement;
  
    // guard against resize before view is rendered
    if(this.chartContainer) {
      // When changing from fullscreen the recorded width before resize is used
      if(!this.fs && this.widthBeforeResize){
        this.divWidth = this.widthBeforeResize;
        this.widthBeforeResize = null;
      }else{
        this.divWidth = el.clientWidth;
      }

      this.divHeight = this.fs ? el.clientHeight : this.height;

      // Redraw
      d3.selectAll("svg").remove();
      this.createChart();
    }
  }

  saveSVG() {
    var config = {
      filename: 'sparql-viz-graph',
    }
    d3_save_svg.save(d3.select('svg').node(), config);
  }

  createChart() {
    const element = this.chartContainer.nativeElement;

    // Get container width
    if(!this.divWidth) this.divWidth = element.clientWidth;
    if(!this.divHeight) this.divHeight = element.clientHeight;

    this.svg = d3.select(element).append('svg')
                  .attr('width', this.divWidth)
                  .attr('height', this.divHeight);

    this.attachData();
  }

  attachData(){
    this.force = d3.layout.force().size([this.divWidth, this.divHeight]);
    // If type of data is text/turtle (not array)
    // the triples must be parsed to objects instead
    if( typeof this.data === 'string' ) {
      this._parseTriples(this.data).then(d => {
        console.log(d);
        var abr = this._abbreviateTriples(d);
        this.graph = this._triplesToGraph(abr);
        this.updateChart();
      })
    }else{
      this.graph = this._triplesToGraph(this.data);
      this.updateChart();
    }
  }

  cleanGraph(){
    // Remove everything below the SVG element
    d3.selectAll("svg > *").remove();
  }

  updateChart() {
    if(!this.svg) return;
    // if(!this.graph) return;

    // ==================== Add Marker ====================
    this.svg.append("svg:defs").selectAll("marker")
      .data(["end"])
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 30)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:polyline")
        .attr("points", "0,-5 10,0 0,5");
    
    // ==================== Add Links ====================
    var links = this.svg.selectAll(".link")
              .data(this.graph.triples)
              .enter()
              .append("path")
                .attr("marker-end", "url(#end)")
                .attr("class", "link");
                
    // ==================== Add Link Names =====================
    var linkTexts = this.svg.selectAll(".link-text")
                  .data(this.graph.triples)
                  .enter()
                  .append("text")
                    .attr("class", "link-text")
                    .text( d => d.p.label);
          
    // ==================== Add Link Names =====================
    var nodeTexts = this.svg.selectAll(".node-text")
                  .data(this._filterNodesByType(this.graph.nodes, "node"))
                  .enter()
                  .append("text")
                    .attr("class", "node-text")
                    .text( d => d.label);
    
    // ==================== Add Node =====================
    var nodes = this.svg.selectAll(".node")
              .data(this._filterNodesByType(this.graph.nodes, "node"))
              .enter()
              .append("circle")
                // .attr("class", "node")
                .attr("class", d => {
                  if(d.owlClass){
                    return "class" 
                  //}else if(d.instSpace){ //MB
                    //return "instance-space" //MB
                  //}else if(d.instSpaceType){ //MB
                    //return "instance-spaceType"	//MB
                  }else if(d.label.indexOf("_:") != -1){
                    return "blank"
                  }else if(d.instance || d.label.indexOf("inst:") != -1){
                    return "instance"
                  }
                  else{
                    return "node"
                  }
                })
                .attr("r", d => {
                  //MB if(d.instance || d.instSpace || d.instSpaceType){            
                  if(d.label.indexOf("_:") != -1){
                    return 7; 	
                  }else if(d.instance || d.label.indexOf("inst:") != -1){
                    return 10;
                  }else if(d.owlClass || d.label.indexOf("inst:") != -1){
                    return 9;
                  }else{
                    return 8;
                  }
                })
                .call(this.force.drag);//nodes

    // ==================== When dragging ====================
    this.force.on("tick", () => {
      nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      
      links
        .attr("d", function(d) {
            return "M" 	+ d.s.x + "," + d.s.y
                  + "S" + d.p.x + "," + d.p.y
                  + " " + d.o.x + "," + d.o.y;
          })
        ;
                
      nodeTexts
        .attr("x", d => d.x + 12)
        .attr("y", d => d.y + 3)
        ;
        

      linkTexts
        .attr("x", d => { return 4 + (d.s.x + d.p.x + d.o.x)/3  ; })
        .attr("y", d => { return 4 + (d.s.y + d.p.y + d.o.y)/3 ; })
        ;
    });
    
    // ==================== Run ====================
    this.force
        .nodes(this.graph.nodes)
        .links(this.graph.links)
        .charge(-500)
        .linkDistance(50)
        .start();
  }

  private _filterNodesById(nodes,id){
    return nodes.filter(n => n.id === id);
  }
  
  private _filterNodesByType(nodes,value){
    return nodes.filter(n => n.type === value);
  }

  private _triplesToGraph(triples){

    //Graph
    var graph: Graph = {nodes:[], links:[], triples:[]};
    
    //Initial Graph from triples
    triples.forEach(triple => {

      var subjId = triple.subject;
      var predId = triple.predicate;
      var objId = triple.object;

      var subjNode: Node = this._filterNodesById(graph.nodes, subjId)[0];
      var objNode: Node  = this._filterNodesById(graph.nodes, objId)[0];

      var predNode: Node = {id:predId, label:predId, weight:1, type:"pred"} ;
      graph.nodes.push(predNode);

      if(subjNode==null){
        subjNode = {id:subjId, label:subjId, weight:1, type:"node"};
        // MB: here I made some mistake. The objNode.label cannot be found as it is only introduced in the next if
        //if(objNode.label == "bot:Space"){subjNode.instSpace = true} //MB
        //else if(objNode.label == "prop:SpaceType"){subjNode.instSpaceType = true} //MB
        //else{} //MB
        graph.nodes.push(subjNode);
      }

      if(objNode==null){
        objNode = {id:objId, label:objId, weight:1, type:"node"};
        // If the predicate is rdf:type, the node is an OWL Class
        // Then the domain is an instance
        if(predNode.label == "rdf:type" || predNode.label == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"){
          objNode.owlClass = true;
          subjNode.instance = true;
        }
        graph.nodes.push(objNode);
      }
            
      var blankLabel = "";
      
      graph.links.push({source:subjNode, target:predNode, predicate:blankLabel, weight:1});
      graph.links.push({source:predNode, target:objNode, predicate:blankLabel, weight:1});
      
      graph.triples.push({s:subjNode, p:predNode, o:objNode});
      
    });
    
    return graph;
  }

  private _parseTriples(triples){
    // ParseTriples
    var parser = N3.Parser();
    var jsonTriples = [];
    return new Promise( (resolve, reject) => {
        parser.parse(triples, (err, triple, prefixes) => {
          if(triple){
            jsonTriples.push(triple);
          }else{
            resolve({triples: jsonTriples, prefixes: prefixes});
          }
          if(err){
            reject(err);
          }
        });
      }
    );
  }

  private _abbreviateTriples(data){

    var prefixes = data.prefixes;
    var triples = [];

    function abbreviate(foi){
      var newVal = null;
      // If FoI has 'http' in its name, continue
      if(foi.indexOf('http') !== -1){
        // Loop over prefixes
        _.each(prefixes, (val, key) => {
          // If the FoI has the prefixed namespace in its name, return it
          if(foi.indexOf(val) !== -1){
            newVal = foi.replace(val, key+':');
          }
        })
      }
      return newVal;
      
    }

    _.each(data.triples, d => {
      var s = d.subject;
      var p = d.predicate;
      var o = d.object;

      if(abbreviate(s) != null) s = abbreviate(s);
      if(abbreviate(p) != null) p = abbreviate(p);
      if(abbreviate(o) != null) o = abbreviate(o);
      triples.push({subject: s, predicate: p, object: o})
    });
    console.log(triples);
    return triples;
  }

}