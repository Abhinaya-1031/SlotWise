import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch((error: any) => {
        this.isLoading = false;
        console.error('Login error:', error);
        // User-friendly error message mapping
        if (
          error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password'
        ) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.code === 'auth/too-many-requests') {
          this.errorMessage = 'Too many failed login attempts. Access has been temporarily disabled. Please try again later.';
        } else {
          this.errorMessage = 'Unable to connect. Please check your credentials or try again later.';
        }
      });
  }
}
