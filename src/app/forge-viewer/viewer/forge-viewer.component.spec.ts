import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgeViewerComponent } from './forge-viewer.component';

describe('ForgeViewerComponent', () => {
  let component: ForgeViewerComponent;
  let fixture: ComponentFixture<ForgeViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgeViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
