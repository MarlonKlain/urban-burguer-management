import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    name = '';
    email = '';
    password = '';
    confirmPassword = '';
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.errorMessage = "Passwords do not match";
            return;
        }

        const request: RegisterRequest = {
            login: this.name, // Using name as login for now
            email: this.email,
            password: this.password
        };
        this.authService.register(request).subscribe({
            next: (response) => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                if (err.error && typeof err.error === 'object') {
                    // Basic error handling assuming map from backend
                    this.errorMessage = Object.values(err.error).join(', ');
                } else {
                    this.errorMessage = "Registration failed. Please try again.";
                }
            }
        });
    }
}
