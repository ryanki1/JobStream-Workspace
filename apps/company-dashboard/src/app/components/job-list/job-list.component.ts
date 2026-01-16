import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, HlmBadgeImports, HlmButtonImports],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent {

}
