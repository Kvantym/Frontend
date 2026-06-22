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
  selector: 'app-auth-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, HttpClientModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private localization: LocalizationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit(event?: Event) {
    event?.preventDefault();
    console.log('Submit clicked', this.loginForm.value);

    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authService.login({ username, password }).subscribe({
        next: (response: any) => {
          console.log('Login successful', response);
          localStorage.setItem('authToken', response.token);

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.errorMessage = this.localization.translate('auth.loginError');
        },
      });
    } else {
      console.warn('Form invalid');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
