import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
    isMobileHost = false; // logic to detect mobile could be added
    isOpen = signal(false);

    toggleSidebar() {
        this.isOpen.update(value => !value);
    }

    closeSidebar() {
        this.isOpen.set(false);
    }
}
