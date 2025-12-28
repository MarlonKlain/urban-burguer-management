import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent {
    private menuService = inject(MenuService);

    items = this.menuService.getItems();
    viewMode = signal<'grid' | 'list'>('grid');

    // Modal State
    isModalOpen = signal(false);
    isEditing = signal(false);

    // Form Data
    currentItem: Partial<MenuItem> = {
        name: '',
        ingredients: '',
        price: 0,
        imageUrl: '',
        category: 'Snack', // Default category
        featured: false
    };

    toggleView() {
        this.viewMode.update(mode => mode === 'grid' ? 'list' : 'grid');
    }

    openAddModal() {
        this.isEditing.set(false);
        this.currentItem = { name: '', ingredients: '', price: 0, imageUrl: '', category: 'Snack', featured: false };
        this.isModalOpen.set(true);
    }

    openEditModal(item: MenuItem) {
        this.isEditing.set(true);
        this.currentItem = { ...item }; // Copy to avoid direct mutation
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
    }

    saveItem() {
        if (this.isEditing() && this.currentItem.id) {
            this.menuService.updateItem(this.currentItem.id, this.currentItem as MenuItem);
        } else {
            this.menuService.addItem(this.currentItem as Omit<MenuItem, 'id'>);
        }
        this.closeModal();
    }

    deleteItem(id: number) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.menuService.deleteItem(id);
        }
    }
}
