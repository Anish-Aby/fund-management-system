import { Component, signal, computed } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { InputOtpModule } from 'primeng/inputotp';
import { CommonModule } from '@angular/common';
import { ToastService } from '../core/services/toast';
import { ThemeService } from '../core/services/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    InputTextModule,
    IftaLabelModule,
    ButtonModule,
    PasswordModule,
    ReactiveFormsModule,
    CarouselModule,
    CommonModule,
    InputOtpModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  loginLoading = signal(false);
  otpLoading = signal(false);
  currentPage = signal(0);
  otpValue = signal('');

  forms = computed(() =>
    this.currentPage() === 0 ? [{ type: 'login' }] : [{ type: 'login' }, { type: 'otp' }]
  );

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loginLoading.set(true);

      setTimeout(() => {
        this.loginLoading.set(false);
        this.currentPage.set(1);
      }, 1000);
    }
  }

  navigateToLogin() {
    this.currentPage.set(0);
  }

  onOtpChange(event: any) {
    this.otpValue.set(event.value);
    if (event.value.length === 6) {
      this.onVerifyOtp();
    }
  }

  onVerifyOtp() {
    this.otpLoading.set(true);
    setTimeout(() => {
      this.otpLoading.set(false);
      this.toast.showSuccess('Logged in successfully!');
      this.router.navigate(['/app/dashboard']);
    }, 1000);
  }
}
