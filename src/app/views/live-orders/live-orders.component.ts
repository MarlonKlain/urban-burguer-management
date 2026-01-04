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
                console.log('New order received:', order);
                this.orders.unshift(order); // Add new order to top
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
                this.cd.detectChanges(); // Force update
            });
        });
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
}
