import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeMonitoringComponent } from './real-time-monitoring.component';

describe('RealTimeMonitoringComponent', () => {
  let component: RealTimeMonitoringComponent;
  let fixture: ComponentFixture<RealTimeMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealTimeMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealTimeMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
