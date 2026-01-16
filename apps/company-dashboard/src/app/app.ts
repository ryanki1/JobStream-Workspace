import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterModule],
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  showAdminLayout = true;
  currentUrl = '';

  constructor() {}

  ngOnInit() {
  }

}
