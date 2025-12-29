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
    styleUrl: './menu.component.scss',
    styles: [`
        .image-upload-row { margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
        .uploading-spinner { font-size: 0.9em; color: #666; }
    `]
})
export class MenuComponent {
    private menuService = inject(MenuService);

    items = this.menuService.getItems();
    categories = this.menuService.categories;
    viewMode = signal<'grid' | 'list'>('grid');

    // Modal State
    isModalOpen = signal(false);
    isEditing = signal(false);
    isUploading = signal(false);

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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.isUploading.set(true);
            this.menuService.uploadImage(file).subscribe({
                next: (response: any) => {
                    this.currentItem.imageUrl = response.secure_url;
                    this.isUploading.set(false);
                },
                error: (err: any) => {
                    console.error('Upload failed', err);
                    this.isUploading.set(false);
                    alert('Image upload failed. Please try again.');
                }
            });
        }
    }

    deleteItem(id: number) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.menuService.deleteItem(id);
        }
    }
}
