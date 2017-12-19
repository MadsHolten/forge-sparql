import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';

import _ from "lodash";

// Interfaces
import { Data, Option } from './choose-model.interface';

@Component({
    selector: 'choose-model-dialog',
    templateUrl: 'choose-model.component.html',
    styleUrls: ['choose-model.component.css']
  })
  export class ChooseModelDialog implements OnInit {

    private urn: string;
    public modelForm: FormGroup;
    public filePaths;
  
    constructor(
      private fb: FormBuilder,
      public dialogRef: MatDialogRef<ChooseModelDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Data) { }
    
    ngOnInit() {
        // Initialize name to first option in data array
        this.modelForm = this.fb.group({
            name: [this.data.options[0], [Validators.required]],
            paths: this.fb.array([
                this.initEmptyPath()
            ])
        });
        // Set default file paths
        this.overwritePaths(this.data.options[0].filePaths);
        this.filePaths = (<FormArray>this.modelForm.controls['paths']).controls;
    }

    // Initialize empty path
    initEmptyPath() {
        // initialize our address
        return this.fb.group({
            path: ['', Validators.required]
        });
    }

    // Initialize paths from source
    overwritePaths(paths) {
        // Clear the paths that are already specified
        this.clearPaths();
        
        // Append the paths from data array
        const control = <FormArray>this.modelForm.controls['paths'];

        for(var i in paths){
            var path = this.fb.group({
                path: [paths[i], Validators.required]
            });
            control.push(path);
        }
    }

    addPath() {
        // add path to the list
        const control = <FormArray>this.modelForm.controls['paths'];
        control.push(this.initEmptyPath());
    }

    removePath(i: number) {
        // remove path from the list
        const control = <FormArray>this.modelForm.controls['paths'];
        control.removeAt(i);
    }

    clearPaths() {
        this.modelForm.controls['paths'] = this.fb.array([]);
    }
    
    onModelChange(model){
        // Get model index
        var filePaths = model.filePaths;
        this.overwritePaths(filePaths);
        this.filePaths = (<FormArray>this.modelForm.controls['paths']).controls;
    }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    onCloseConfirm(ev) {
        var name = ev.get('name').value.name;
        var urn = ev.get('name').value.urn;
        var paths = []
        _.each(ev.get('paths').value, x => { paths.push(x.path) });
        var data: Option = {name: name, urn: urn, filePaths: paths};
        this.dialogRef.close(data);
    }
    onCloseCancel() {
        this.dialogRef.close(null);
    }

    backdropClick() {
        this.dialogRef.close(null);
    }
  
  }

  