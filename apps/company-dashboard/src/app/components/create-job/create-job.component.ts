import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, HlmAccordionImports, HlmBadgeImports, HlmButtonImports],
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent {

}
