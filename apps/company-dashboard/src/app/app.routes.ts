import { Route } from '@angular/router';
import { JobListComponent } from './components/job-list/job-list.component';
import { CreateJobComponent } from './components/create-job/create-job.component';

export const appRoutes: Route[] = [
  {
    path: 'company',
    component: JobListComponent,
    title: 'Job Posting List',
    children: [
      {
        path: 'create',
        component: CreateJobComponent,
        title: 'Create Job Posting'
      }
    ]
  },
];
