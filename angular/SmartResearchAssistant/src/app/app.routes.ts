import { Routes } from '@angular/router';
import { SameSensorTypeComponent } from './same-sensor-type/same-sensor-type.component';
import { DifferentSensorTypesComponent } from './different-sensor-types/different-sensor-types.component';
import { HistoricalVisualizationComponent } from './historical-visualization/historical-visualization.component';
import { ActivityClassificationComponent } from './activity-classification/activity-classification.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './guards/auth.guard'; // <-- Uncomment this line
import { RealTimeMonitoringComponent } from './real-time-monitoring/real-time-monitoring.component';
import { SaraAdminModule } from './sara-admin/sara-admin/sara-admin.module';
import { DatasetWizardComponent } from './dataset-wizard/dataset-wizard.component';
import { DatasetManagementComponent } from './dataset-management/dataset-management.component';
export const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: AuthComponent },
  { path: 'signup', component: AuthComponent },
  {
    path: 'admin',
    loadChildren: () => import('./sara-admin/sara-admin/sara-admin.module').then(m => m.SaraAdminModule),
    canActivate: [AuthGuard]
  },
  // Protected routes
  { path: 'dataset-wizard', component: DatasetWizardComponent, canActivate: [AuthGuard] },
  { path: 'historical-visualization', component: HistoricalVisualizationComponent, canActivate: [AuthGuard] },
  { path: 'activity-classification', component: ActivityClassificationComponent, canActivate: [AuthGuard] },
  { path: 'real-time-monitoring', component: RealTimeMonitoringComponent, canActivate: [AuthGuard] },
  { path: 'datasets', component: DatasetManagementComponent, canActivate: [AuthGuard] },
  { path: 'datasets/:id', component: DatasetManagementComponent, canActivate: [AuthGuard] },
  { path: 'datasets/new', component: DatasetWizardComponent, canActivate: [AuthGuard] },
  { 
    path: 'data-comparison',
    canActivate: [AuthGuard],
    children: [
      { path: 'same-type', component: SameSensorTypeComponent },
      { path: 'different-types', component: DifferentSensorTypesComponent },
      { path: '', redirectTo: 'same-type', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'signin' }
];