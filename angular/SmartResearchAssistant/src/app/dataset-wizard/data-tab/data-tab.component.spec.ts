import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTabComponent } from './data-tab.component';

describe('DataTabComponent', () => {
  let component: DataTabComponent;
  let fixture: ComponentFixture<DataTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
