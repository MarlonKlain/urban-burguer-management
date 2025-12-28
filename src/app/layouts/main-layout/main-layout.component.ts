import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent],
    template: `
    <div class="layout-wrapper">
      <app-sidebar></app-sidebar>
      <main class="content-area">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`
    .layout-wrapper {
      display: flex;
      height: 100vh;
      height: 100dvh;
      width: 100%;
      overflow: hidden;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      height: 100%;
      position: relative;
    }
  `]
})
export class MainLayoutComponent { }
