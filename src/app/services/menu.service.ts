import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MenuItem } from '../models/menu-item.model';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/menu`;
    private items = signal<MenuItem[]>([]);

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getItems() {
        this.http.get<MenuItem[]>(this.apiUrl, { headers: this.getHeaders() })
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
