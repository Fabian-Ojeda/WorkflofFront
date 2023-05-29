import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDiagramComponent } from './my-diagram.component';

describe('MyDiagramComponent', () => {
  let component: MyDiagramComponent;
  let fixture: ComponentFixture<MyDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyDiagramComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
