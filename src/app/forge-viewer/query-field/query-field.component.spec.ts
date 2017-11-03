import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryFieldComponent } from './query-field.component';

describe('QueryFieldComponent', () => {
  let component: QueryFieldComponent;
  let fixture: ComponentFixture<QueryFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
