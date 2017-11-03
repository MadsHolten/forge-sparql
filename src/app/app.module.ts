import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

//Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import {  MatSelectModule, 
          MatToolbarModule, 
          MatInputModule,
          MatIconModule,
          MatListModule,
          MatFormFieldModule, 
          MatProgressBarModule, 
          MatButtonModule, 
          MatCheckboxModule,
          MatTableModule,
          MatDialogModule,
          MatSlideToggleModule,
          MatCardModule,
          MatProgressSpinnerModule
} from '@angular/material';
import 'hammerjs';

//Split pane
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

//App components
import { AppComponent } from './app.component';

//Viewer
import { ViewerContainerComponent } from './forge-viewer/viewer-container.component';
import { ForgeViewerComponent } from './forge-viewer/viewer/forge-viewer.component';
import { ResultTableComponent } from './forge-viewer/result-table/result-table.component';
import { QueryFieldComponent } from './forge-viewer/query-field/query-field.component';

@NgModule({
  declarations: [
    AppComponent,
    ViewerContainerComponent,
    ForgeViewerComponent,
    ResultTableComponent,
    QueryFieldComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    SplitPaneModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule { }
