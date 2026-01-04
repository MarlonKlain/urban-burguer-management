import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private stompClient: Client;
    private orderSubject: Subject<any> = new Subject<any>();

    constructor() {
        this.stompClient = new Client({
            // Use SockJS for fallback
            webSocketFactory: () => new SockJS(environment.wsUrl),
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            this.stompClient.subscribe('/topic/orders', (message: Message) => {
                if (message.body) {
                    this.orderSubject.next(JSON.parse(message.body));
                }
            });
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.stompClient.activate();
    }

    public getOrders(): Observable<any> {
        return this.orderSubject.asObservable();
    }
}
