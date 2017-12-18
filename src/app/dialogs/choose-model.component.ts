import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { NgForm } from '@angular/forms';

// Interfaces
import { Data } from './choose-model.interface';

@Component({
    selector: 'choose-model-dialog',
    templateUrl: 'choose-model.component.html',
    styleUrls: ['choose-model.component.css']
  })
  export class ChooseModelDialog {

    private urn: string;
    private filePaths: string[];
  
    constructor(
      public dialogRef: MatDialogRef<ChooseModelDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Data) { }

    onChange(ev){
        // Update filepaths of chosen model
        this.filePaths = ev.filePaths;
    }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    onCloseConfirm(ev) {
        this.dialogRef.close(ev);
    }
    onCloseCancel() {
        this.dialogRef.close(null);
    }

    backdropClick() {
        this.dialogRef.close(null);
    }
  
  }

  