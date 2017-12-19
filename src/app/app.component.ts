import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ChooseModelDialog } from './dialogs/choose-model.component'

// Interfaces
import { Option } from './dialogs/choose-model.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public models: Option[] = [
      {
        "name": "Test_project", 
        "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bmlyYXNfcDEwMTEwMS90ZXN0cHJvamVrdF9VUklzLm53Yw",
        "filePaths": ["testmodel.ttl", "bot.ttl"]
      },
      {
        "name": "Duplex", 
        "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE3LTEyLTE4LTEyLTM2LTQxLWQ0MWQ4Y2Q5OGYwMGIyMDRlOTgwMDk5OGVjZjg0MjdlL0R1cGxleF9BLnJ2dA",
        "filePaths": ["Duplex_A.ttl", "bot.ttl"]
      }
  ];
  public urn = this.models[0].urn;
  public filePaths = this.models[0].filePaths;

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
      this.urn = result.urn;
      this.filePaths = result.filePaths;
    });
  }

}
