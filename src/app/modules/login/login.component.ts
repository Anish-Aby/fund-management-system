import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { InputOtpModule } from 'primeng/inputotp';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ToastService } from '../core/services/toast';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../core/services/auth-service';
import { PanelFeature, PanelSlide } from './model/login.model';
import {
  API_URLS,
  LOGIN_PANEL_VISIBLE_DURATION,
  LOGIN_TEXT_EXIT_DURATION,
  ROUTER_PATHS,
  TOAST_MESSAGES,
} from '../shared/constants/const';
import { UtilityService } from '../shared/services/utility.service';
import LoginLeftPanelMock from '../core/mocks/login-left-panel-mock.json';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    InputOtpModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  loginForm: FormGroup;
  otpForm: FormGroup;
  forgotEmailForm: FormGroup;
  forgotOtpForm: FormGroup;
  newPasswordForm: FormGroup;

  currentPage = signal<number>(0);
  resendCountdown = signal<number>(30);
  private userId = signal<number | null>(null);
  forgotResendCountdown = signal(30);
  private forgotUserId = signal<number | null>(null);
  displaySlide = signal<number>(0);

  loginLoading = signal<boolean>(false);
  otpLoading = signal<boolean>(false);
  resendDisabled = signal<boolean>(true);
  forgotLoading = signal<boolean>(false);
  forgotOtpLoading = signal<boolean>(false);
  newPasswordLoading = signal<boolean>(false);
  forgotResendDisabled = signal<boolean>(true);
  isExiting = signal<boolean>(false);
  showSlide = signal<boolean>(true);

  private forgotEmailValue = signal<string>('');

  rightSlides: PanelSlide[] = LoginLeftPanelMock;

  readonly rightFeatures: PanelFeature[] = [
    { icon: 'pi-file-plus', label: 'Invoice processing' },
    { icon: 'pi-sparkles', label: 'AI extraction' },
    { icon: 'pi-chart-bar', label: 'Fund reporting' },
  ];

  private slideTimer?: ReturnType<typeof setInterval>;
  private exitTimeout?: ReturnType<typeof setTimeout>;
  private resendTimer?: ReturnType<typeof setInterval>;
  private forgotResendTimer?: ReturnType<typeof setInterval>;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private utilityService: UtilityService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.forgotEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.forgotOtpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.newPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.utilityService.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.startSlideTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.slideTimer);
    clearTimeout(this.exitTimeout);
    clearInterval(this.resendTimer);
    clearInterval(this.forgotResendTimer);
  }

  private startSlideTimer(): void {
    this.slideTimer = setInterval(
      () => this.advanceTo((this.displaySlide() + 1) % this.rightSlides.length),
      LOGIN_PANEL_VISIBLE_DURATION + LOGIN_TEXT_EXIT_DURATION + 810,
    );
  }

  setSlide(index: number): void {
    if (index === this.displaySlide() || this.isExiting()) return;
    clearInterval(this.slideTimer);
    this.advanceTo(index);
    this.startSlideTimer();
  }

  private advanceTo(next: number): void {
    this.isExiting.set(true);
    this.exitTimeout = setTimeout(() => {
      this.showSlide.set(false);
      requestAnimationFrame(() => {
        this.displaySlide.set(next);
        this.isExiting.set(false);
        this.showSlide.set(true);
      });
    }, LOGIN_TEXT_EXIT_DURATION);
  }

  onLogin(): void {
    if (!this.loginForm.valid) return;
    this.apiService
      .post(API_URLS.LOGIN, this.getLoginPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.userId.set(res.data.userId);
          this.currentPage.set(1);
          this.startResendCountdown();
        },
      });
  }

  getLoginPayload(): any {
    return {
      emailId: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };
  }

  onVerifyOtp(): void {
    const userId = this.userId();
    if (userId === null) {
      this.toastService.showError(TOAST_MESSAGES.PLEASE_LOG_IN_AGAIN);
      return;
    }
    if (this.otpForm.invalid) return;
    this.apiService
      .post(API_URLS.VERIFY_OTP, {
        userId,
        otp: this.otpForm.get('otp')?.value,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.authService.setTokens(res.data.token, res.data.refreshToken);
          this.toastService.showSuccess(TOAST_MESSAGES.LOGGED_IN_SUCCESSFULLY);
          this.router.navigate([ROUTER_PATHS.DASHBOARD]);
        },
      });
  }

  onResendCode(): void {
    this.startResendCountdown();
  }

  navigateToLogin(): void {
    clearInterval(this.resendTimer);
    this.otpForm.reset();
    this.currentPage.set(0);
  }

  getResendButtonLabel(): string {
    return this.resendDisabled() ? `Resend in ${this.resendCountdown()}s` : 'Resend code';
  }

  private startResendCountdown(): void {
    clearInterval(this.resendTimer);
    this.resendDisabled.set(true);
    this.resendCountdown.set(30);
    this.resendTimer = setInterval(() => {
      const n = this.resendCountdown() - 1;
      this.resendCountdown.set(n);
      if (n <= 0) {
        clearInterval(this.resendTimer);
        this.resendDisabled.set(false);
      }
    }, 1000);
  }

  navigateToForgotEmail(): void {
    this.forgotEmailForm.reset();
    this.currentPage.set(2);
  }

  navigateBackToForgotEmail(): void {
    clearInterval(this.forgotResendTimer);
    this.forgotOtpForm.reset();
    this.currentPage.set(2);
  }

  navigateBackToLogin(): void {
    clearInterval(this.forgotResendTimer);
    this.forgotEmailForm.reset();
    this.forgotOtpForm.reset();
    this.newPasswordForm.reset();
    this.currentPage.set(0);
  }

  onForgotPassword(): void {
    if (this.forgotEmailForm.invalid) return;
    this.forgotLoading.set(true);
    const email = this.forgotEmailForm.get('email')!.value;
    this.forgotEmailValue.set(email);
    // this.apiService
    //   .post(API_URLS.FORGOT_PASSWORD, { email })
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (res: any) => {
    //       this.forgotLoading.set(false);
    //       this.forgotUserId.set(res.data?.userId ?? null);
    //       this.currentPage.set(3);
    //       this.startForgotResendCountdown();
    //     },
    //     error: () => {
    //       this.forgotLoading.set(false);
    //     },
    //   });
    this.currentPage.set(3);
  }

  onVerifyForgotOtp(): void {
    if (this.forgotOtpForm.invalid) return;
    this.forgotOtpLoading.set(true);
    // this.apiService
    //   .post(API_URLS.VERIFY_OTP, {
    //     userId: this.forgotUserId(),
    //     otp: this.forgotOtpForm.get('otp')!.value,
    //   })
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: () => {
    //       this.forgotOtpLoading.set(false);
    //       this.currentPage.set(4);
    //     },
    //     error: () => {
    //       this.forgotOtpLoading.set(false);
    //     },
    //   });
    this.currentPage.set(4);
  }

  onSetNewPassword(): void {
    if (this.newPasswordForm.invalid) return;
    this.newPasswordLoading.set(true);
    this.apiService
      .post(API_URLS.RESET_PASSWORD, {
        email: this.forgotEmailValue(),
        otp: this.forgotOtpForm.get('otp')!.value,
        newPassword: this.newPasswordForm.get('password')!.value,
        confirmPassword: this.newPasswordForm.get('confirmPassword')!.value,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.newPasswordLoading.set(false);
          this.toastService.showSuccess('Password updated successfully!');
          this.newPasswordForm.reset();
          this.forgotEmailForm.reset();
          this.forgotOtpForm.reset();
          this.currentPage.set(0);
        },
        error: () => {
          this.newPasswordLoading.set(false);
        },
      });
  }

  onForgotResendCode(): void {
    this.startForgotResendCountdown();
  }

  getForgotResendLabel(): string {
    return this.forgotResendDisabled()
      ? `Resend in ${this.forgotResendCountdown()}s`
      : 'Resend code';
  }

  private startForgotResendCountdown(): void {
    clearInterval(this.forgotResendTimer);
    this.forgotResendDisabled.set(true);
    this.forgotResendCountdown.set(30);
    this.forgotResendTimer = setInterval(() => {
      const n = this.forgotResendCountdown() - 1;
      this.forgotResendCountdown.set(n);
      if (n <= 0) {
        clearInterval(this.forgotResendTimer);
        this.forgotResendDisabled.set(false);
      }
    }, 1000);
  }

  get forgotEmailMasked(): string {
    const email = this.forgotEmailValue();
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const masked = local.slice(0, 2) + '•'.repeat(Math.max(0, local.length - 2));
    return `${masked}@${domain}`;
  }

  get newPasswordStrength(): number {
    const pw: string = this.newPasswordForm?.get('password')?.value ?? '';
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  get newPasswordStrengthLabel(): string {
    switch (this.newPasswordStrength) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  }

  get newPasswordStrengthLabelClass(): string {
    switch (this.newPasswordStrength) {
      case 1:
        return 'text-rose-500';
      case 2:
        return 'text-amber-500';
      case 3:
        return 'text-blue-500';
      case 4:
        return 'text-emerald-500';
      default:
        return 'text-slate-300';
    }
  }

  strengthBarClass(index: number): string {
    const s = this.newPasswordStrength;
    if (s < index) return 'bg-slate-100';
    if (s === 1) return 'bg-rose-400';
    if (s === 2) return 'bg-amber-400';
    if (s === 3) return 'bg-blue-400';
    return 'bg-emerald-400';
  }

  get passwordRequirements(): { label: string; met: boolean }[] {
    const pw: string = this.newPasswordForm?.get('password')?.value ?? '';
    return [
      { label: 'At least 8 characters', met: pw.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(pw) },
      { label: 'One number', met: /[0-9]/.test(pw) },
      { label: 'One special character', met: /[^A-Za-z0-9]/.test(pw) },
    ];
  }

  get confirmPasswordMismatch(): boolean {
    const ctrl = this.newPasswordForm?.get('confirmPassword');
    return !!(ctrl?.dirty && this.newPasswordForm?.errors?.['mismatch']);
  }
}
