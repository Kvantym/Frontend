import {
  Component,
  EventEmitter,
  Output,
  Input,
  Inject,
  NgZone,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PLATFORM_ID } from '@angular/core';
import { AppLanguage, LocalizationService } from '../../services/localization.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-auth-profil',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TranslatePipe],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class UpdateUserComponent implements OnChanges {
  @Input() user: any;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<string>();

  userName: string | null = null;
  email: string | null = null;
  password: string | null = null;
  isEditingUserName = false;
  isEditingUserEmail = false;
  isEditingUserPassword = false;
  updateUserNameForm: FormGroup;
  updateUserEmailForm: FormGroup;
  updateUserPasswordForm: FormGroup;
  errorMessage: string | null = null;
  selectedLanguage: AppLanguage;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cd: ChangeDetectorRef,
    public localization: LocalizationService
  ) {
    this.selectedLanguage = this.localization.language();

    this.updateUserNameForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
    this.updateUserEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.updateUserPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userName = payload.unique_name || payload.email || this.localization.translate('auth.defaultUser');
          this.email = payload.email || null;
          this.password = payload.password || null;
        } catch (e) {
          console.error('Error parsing token:', e);
          this.userName = this.localization.translate('auth.defaultUser');
        }
      }
    }
  }

  ngOnChanges() {
    if (this.user) {
      this.userName = this.user.username;
      this.updateUserNameForm.patchValue({
        name: this.user.username,
      });
      this.updateUserEmailForm.patchValue({
        email: this.user.email,
      });
    }
  }
  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userName = user.userName;
        this.email = user.email || null;
        this.updateUserNameForm.patchValue({ name: this.userName });
        this.updateUserEmailForm.patchValue({ email: this.email });
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user', err);
      },
    });
  }

  updateUserName() {
    if (!this.updateUserNameForm.valid) return;

    const { name } = this.updateUserNameForm.value;

    this.authService.updateUserName(name).subscribe({
      next: () =>
        this.ngZone.run(() => {
          this.authService.getCurrentUser().subscribe((user) => {
            this.userName = user.userName;
            this.isEditingUserName = false;
            console.log('User name updated successfully', user);
          });
        }),
      error: (err) => {
        console.error(err);
        this.errorMessage = this.localization.translate('profile.updateError');
      },
    });
  }

  updateUserEmail() {
    if (!this.updateUserEmailForm.valid) return;

    const { email } = this.updateUserEmailForm.value;

    this.authService.updateUserEmail(email).subscribe({
      next: () =>
        this.ngZone.run(() => {
          this.authService.getCurrentUser().subscribe((user) => {
            this.email = user.email ? user.email : null;
            this.isEditingUserEmail = false;
            console.log('User email updated successfully', user);
          });
        }),
      error: (err) => {
        console.error(err);
        this.errorMessage = this.localization.translate('profile.updateError');
      },
    });
  }

  updateUserPassword() {
    if (!this.updateUserPasswordForm.valid) return;

    const { password } = this.updateUserPasswordForm.value;

    this.authService.updateUserPassword(password).subscribe({
      next: () =>
        this.ngZone.run(() => {
          this.authService.getCurrentUser().subscribe((user) => {
            this.isEditingUserPassword = false;
            console.log('User password updated successfully', password);
          });
        }),
      error: (err) => {
        console.error(err);
        this.errorMessage = this.localization.translate('profile.updateError');
      },
    });
  }

  onCancelEditName() {
    this.updateUserNameForm.patchValue({
      name: this.user?.username,
    });
    this.isEditingUserName = false;
  }

  onCancelEditEmail() {
    this.updateUserEmailForm.patchValue({
      email: this.user?.email,
    });
    this.isEditingUserEmail = false;
  }
  onCancelEditPassword() {
    this.isEditingUserPassword = false;
  }

  onLanguageChange(language: string) {
    this.selectedLanguage = language as AppLanguage;
    this.localization.setLanguage(this.selectedLanguage);
  }
}
