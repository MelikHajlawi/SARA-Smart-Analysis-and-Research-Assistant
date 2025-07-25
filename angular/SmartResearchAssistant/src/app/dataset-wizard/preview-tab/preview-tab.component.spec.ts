import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTabComponent } from './preview-tab.component';

describe('PreviewTabComponent', () => {
  let component: PreviewTabComponent;
  let fixture: ComponentFixture<PreviewTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
