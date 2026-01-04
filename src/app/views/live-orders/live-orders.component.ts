import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/websocket.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-live-orders',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './live-orders.component.html',
    styleUrls: ['./live-orders.component.scss']
})
export class LiveOrdersComponent implements OnInit, OnDestroy {
    orders: any[] = [];

    // Status queues
    pendingOrders: any[] = [];
    preparingOrders: any[] = [];
    readyOrders: any[] = [];
    deliveryOrders: any[] = [];
    completedOrders: any[] = [];

    private orderSubscription: Subscription | undefined;

    // Simple notification sound (beep)
    private audio = new Audio('https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3');

    constructor(
        private webSocketService: WebSocketService,
        private http: HttpClient,
        private ngZone: NgZone,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadHistoricOrders();
        this.orderSubscription = this.webSocketService.getOrders().subscribe((order: any) => {
            this.ngZone.run(() => {
                console.log('Order update received:', order);
                this.updateOrderInList(order);
                this.playNotificationSound();
                this.cd.detectChanges(); // Force update
            });
        });
    }

    ngOnDestroy(): void {
        if (this.orderSubscription) {
            this.orderSubscription.unsubscribe();
        }
    }

    loadHistoricOrders() {
        this.http.get<any[]>(`${environment.apiUrl}/orders`).subscribe(data => {
            this.ngZone.run(() => {
                console.log('Historic orders loaded:', data);
                this.orders = data;
                this.categorizeOrders();
                this.cd.detectChanges(); // Force update
            });
        });
    }

    categorizeOrders() {
        this.pendingOrders = this.orders.filter(o => o.status === 'PENDING');
        this.preparingOrders = this.orders.filter(o => o.status === 'PREPARING');
        this.readyOrders = this.orders.filter(o => o.status === 'READY');
        this.deliveryOrders = this.orders.filter(o => o.status === 'IN_DELIVERY');
        this.completedOrders = this.orders.filter(o => o.status === 'COMPLETED');
    }

    updateOrderInList(updatedOrder: any) {
        // Remove from existing list logic if it exists (update scenario)
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
            this.orders[index] = updatedOrder;
        } else {
            this.orders.unshift(updatedOrder);
        }
        this.categorizeOrders();
    }

    playNotificationSound() {
        this.audio.play().catch(error => console.error('Error playing sound:', error));
    }

    formatItems(itemsJson: string): any[] {
        try {
            if (!itemsJson) return [];
            return JSON.parse(itemsJson);
        } catch (e) {
            return [];
        }
    }

    updateStatus(order: any, newStatus: string) {
        this.http.put(`${environment.apiUrl}/orders/${order.id}/status`, newStatus).subscribe({
            next: (updatedOrder: any) => {
                console.log('Status updated locally triggered', updatedOrder);
            },
            error: (err) => console.error('Failed to update status', err)
        });
    }

    getElapsedTime(createdAt: string): string {
        if (!createdAt) return '';
        const start = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 60000); // minutes
        if (diff < 1) return 'Just now';
        return `${diff} min ago`;
    }
}
