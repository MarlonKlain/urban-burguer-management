import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MenuItem } from '../models/menu-item.model';
import { map, tap } from 'rxjs/operators';
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

        const filename = originalUrl.split('/').pop()?.split('.')[0];
        if (!filename) return originalUrl;

        const publicId = filename;
        const myImage = this.cld.image(publicId);
        myImage.resize(fill().width(400).height(400)); // Smaller for admin table

        return myImage.toURL();
    }

    getItems() {
        this.http.get<MenuItem[]>(this.apiUrl, { headers: this.getHeaders() })
            .pipe(
                map(data => data.map(item => ({
                    ...item,
                    imageUrl: this.getProductImage(item.imageUrl)
                })))
            )
            .subscribe(data => this.items.set(data));
        return this.items;
    }

    addItem(item: Omit<MenuItem, 'id'>) {
        this.http.post<MenuItem>(this.apiUrl, item, { headers: this.getHeaders() })
            .subscribe(newItem => {
                this.items.update(values => [...values, newItem]);
            });
    }

    updateItem(id: number, updatedItem: MenuItem) {
        this.http.put<MenuItem>(`${this.apiUrl}/${id}`, updatedItem, { headers: this.getHeaders() })
            .subscribe(returnedItem => {
                this.items.update(values => values.map(item => item.id === id ? returnedItem : item));
            });
    }

    deleteItem(id: number) {
        this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
            .subscribe(() => {
                this.items.update(values => values.filter(item => item.id !== id));
            });
    }
}
