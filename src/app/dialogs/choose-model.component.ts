import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface Data {
    title: string;
    text: string;
    options: Option;
}

export interface Option {
    name: string;
    value: string;
}

@Component({
    selector: 'choose-model-dialog',
    templateUrl: 'choose-model.component.html',
    styleUrls: ['choose-model.component.css']
  })
  export class ChooseModelDialog {

    private urn: string;
  
    constructor(
      public dialogRef: MatDialogRef<ChooseModelDialog>,
      @Inject(MAT_DIALOG_DATA) public data: Data) { }
  
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

  