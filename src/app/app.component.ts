import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ChooseModelDialog } from './dialogs/choose-model.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public models = [
      {"name": "testprojekt", "value": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bmlyYXNfcDEwMTEwMS90ZXN0cHJvamVrdF9VUklzLm53Yw"},
      {"name": "Duplex", "value": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTEyLTE4LTEyLTM2LTQxLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL0R1cGxleF9BLnJ2dA"}
  ];
  public urn = this.models[0].value;

  constructor(public dialog: MatDialog) {}

  openDialog() {
    let dialogRef = this.dialog.open(ChooseModelDialog, {
      width: '600px',
      data: {
        title: 'CHOOSE MODEL',
        text: 'Please select a model from the list',
        options: this.models
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log("result: "+result)
      this.urn = result;
    });
  }

}
