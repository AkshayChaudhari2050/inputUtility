import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookReportOutFlowComponent } from './book-report-out-flow.component';

describe('BookReportOutFlowComponent', () => {
  let component: BookReportOutFlowComponent;
  let fixture: ComponentFixture<BookReportOutFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookReportOutFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookReportOutFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
