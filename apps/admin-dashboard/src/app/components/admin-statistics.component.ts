import { Component, inject } from '@angular/core';
import { AdminApiService } from '../services/admin-api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin-statistics',
  imports: [DecimalPipe],
  templateUrl: './admin-statistics.component.html',
  styleUrl: './admin-statistics.component.scss',
})
export class AdminStatisticsComponent {
  private readonly adminService = inject(AdminApiService);
  public statistics = toSignal(this.adminService.getStatistics());

  getAverageReviewDays(): string {
    const avgReviewHours = this.statistics()?.averageReviewTimeHours;
    if (!avgReviewHours) return '0 days';
    
    const days = Math.floor(avgReviewHours / 24);
    const hours = Math.round(avgReviewHours % 24);
    
    if (days === 0) return `${hours}h`;
    if (hours === 0) return `${days}d`;
    return `${days}d ${hours}h`;
  }

}
