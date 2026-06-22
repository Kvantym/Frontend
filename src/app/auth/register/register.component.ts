import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LocalizationService } from '../../services/localization.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, HttpClientModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private localization: LocalizationService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(event?: Event) {
    event?.preventDefault();
    console.log('Submit clicked', this.registerForm.value);

    if (this.registerForm.valid) {
      const { username, password, email } = this.registerForm.value;

      if (this.registerForm.valid) {
        this.authService.register({ username, password, email }).subscribe({
          next: (token: string) => {
            console.log('Registration successful', token);
            localStorage.setItem('authToken', token);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Registration failed', err);
            console.error('Backend says:', err.error);
            this.errorMessage = this.localization.translate('auth.registerError');
          },
        });
      }
    }
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
