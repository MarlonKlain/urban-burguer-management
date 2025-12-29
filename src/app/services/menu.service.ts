import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MenuItem } from '../models/menu-item.model';
import { map, tap, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/menu`;
    private items = signal<MenuItem[]>([]);

    // Computed signal to get unique categories from loaded items
    categories = computed(() => {
        const uniqueCategories = new Set(this.items().map(item => item.category || 'Other'));
        return Array.from(uniqueCategories).sort();
    });

    private cld = new Cloudinary({
        cloud: {
            cloudName: environment.cloudinary.cloudName
        }
    });

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    private getProductImage(originalUrl: string): string {
        if (!originalUrl) return 'assets/placeholder.png'; // Fallback

        // Extract filename from URL
        let filename = originalUrl.split('/').pop();
        if (!filename) return originalUrl;

        // Remove query parameters (e.g., ?_a=...)
        filename = filename.split('?')[0];

        // Remove extension (e.g., .png)
        filename = filename.split('.')[0];

        if (!filename) return originalUrl;

        // Prepend the folder to the public ID
        const publicId = `${environment.cloudinary.folder}/${filename}`;
        const myImage = this.cld.image(publicId);
        myImage.resize(fill().width(400).height(400)); // Smaller for admin table

        return myImage.toURL();
    }

    getItems() {
        this.http.get<MenuItem[]>(this.apiUrl, { headers: this.getHeaders() })
            .pipe(
                map(data => data.map(item => ({
                    ...item,
                    displayUrl: this.getProductImage(item.imageUrl) // Set display URL, keep original imageUrl
                })))
            )
            .subscribe(data => this.items.set(data));
        return this.items;
    }

    addItem(item: Omit<MenuItem, 'id'>) {
        console.log('[MenuService] Adding item:', item);
        this.http.post<MenuItem>(this.apiUrl, item, { headers: this.getHeaders() })
            .subscribe({
                next: (newItem) => {
                    const itemWithDisplay = {
                        ...newItem,
                        displayUrl: this.getProductImage(newItem.imageUrl)
                    };
                    this.items.update(values => [...values, itemWithDisplay]);
                },
                error: (err) => console.error('[MenuService] Add failed:', err)
            });
    }

    updateItem(id: number, updatedItem: MenuItem) {
        console.log(`[MenuService] Updating item ${id}:`, updatedItem);
        this.http.put<MenuItem>(`${this.apiUrl}/${id}`, updatedItem, { headers: this.getHeaders() })
            .subscribe({
                next: (returnedItem) => {
                    console.log('[MenuService] Update success:', returnedItem);
                    const itemWithDisplay = {
                        ...returnedItem,
                        displayUrl: this.getProductImage(returnedItem.imageUrl)
                    };
                    this.items.update(values => values.map(item => item.id === id ? itemWithDisplay : item));
                },
                error: (err) => console.error('[MenuService] Update failed:', err)
            });
    }

    deleteItem(id: number) {
        this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
            .subscribe(() => {
                this.items.update(values => values.filter(item => item.id !== id));
            });
    }

    uploadImage(file: File) {
        const url = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', environment.cloudinary.uploadPreset);
        formData.append('folder', environment.cloudinary.folder);

        return this.http.post<any>(url, formData);
    }
}
