import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

//Angular material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, 
         MatSelectModule,
         MatToolbarModule,
         MatInputModule,
         MatIconModule,
         MatListModule,
         MatFormFieldModule,
         MatProgressBarModule,
         MatCheckboxModule,
         MatTableModule,
         MatDialogModule,
         MatSlideToggleModule,
         MatCardModule,
         MatProgressSpinnerModule } from '@angular/material';

// Split pane
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

// FxFlex
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { AppComponent } from './app.component';
import { ViewerContainerComponent } from './forge-viewer/viewer-container.component';
import { QueryFieldComponent } from './forge-viewer/query-field/query-field.component';
import { QueryResultTableComponent } from './forge-viewer/query-result-table/query-result-table.component';
import { ForgeViewerComponent } from './forge-viewer/viewer/viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    ViewerContainerComponent,
    QueryFieldComponent,
    QueryResultTableComponent,
    ForgeViewerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSelectModule,
    MatToolbarModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatTableModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SplitPaneModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
