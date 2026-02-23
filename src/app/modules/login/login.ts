import {
  Component,
  signal,
  computed,
  inject,
  DestroyRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
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
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../core/services/auth-service';
import { takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface Dot {
  bx: number;
  by: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
}

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
export class Login implements AfterViewInit, OnDestroy {
  @ViewChild('dotCanvas') dotCanvasRef?: ElementRef<HTMLCanvasElement>;

  destroyRef = inject(DestroyRef);

  private ngZone = inject(NgZone);

  loginForm: FormGroup;
  otpForm: FormGroup;
  loginLoading = signal(false);
  otpLoading = signal(false);
  currentPage = signal(0);
  otpValue = signal('');
  resendTimer = signal(120);
  resendDisabled = signal(true);

  userId = signal<number | null>(null);

  // Typewriter
  typewriterWord = signal('effortlessly.');

  private timerInterval?: number;
  private rafId?: number;
  private resizeObserver?: ResizeObserver;
  private twTimeout?: ReturnType<typeof setTimeout>;

  private readonly WORDS = [
    'effortlessly.',
    'efficiently.',
    'intelligently.',
    'seamlessly.',
    'confidently.',
  ];
  private readonly TYPE_SPEED = 120;
  private readonly DELETE_SPEED = 50;
  private readonly HOLD_AFTER = 2000;
  private readonly PAUSE_BEFORE = 280;

  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  // Dot grid
  private readonly SPACING = 28;
  private readonly DOT_RADIUS = 0.9;
  private readonly AMPLITUDE = 3.5;
  private readonly BASE_ALPHA = 0.06;

  private dots: Dot[] = [];
  private elapsed = 0;
  private lastTime: number | null = null;

  forms = computed(() =>
    this.currentPage() === 0 ? [{ type: 'login' }] : [{ type: 'login' }, { type: 'otp' }],
  );

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    public themeService: ThemeService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterViewInit(): void {
    // Typewriter runs inside the zone so signals trigger CD normally
    this.startTypewriter();

    // Dot grid RAF runs outside the zone — only canvas draws, no CD needed
    if (this.dotCanvasRef?.nativeElement) {
      this.ngZone.runOutsideAngular(() => this.initDotGrid());
    }
  }

  ngOnDestroy(): void {
    if (this.twTimeout) clearTimeout(this.twTimeout);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  // ── Typewriter ────────────────────────────────────────────────

  private startTypewriter(): void {
    this.wordIndex = 0;
    this.charIndex = this.WORDS[0].length; // first word already shown
    this.isDeleting = true; // start by erasing the first word after the hold
    this.twTimeout = setTimeout(() => this.tick(), this.HOLD_AFTER);
  }

  private tick(): void {
    const current = this.WORDS[this.wordIndex];

    if (!this.isDeleting) {
      // Typing forward
      this.charIndex++;
      this.typewriterWord.set(current.slice(0, this.charIndex));

      if (this.charIndex === current.length) {
        this.isDeleting = true;
        this.twTimeout = setTimeout(() => this.tick(), this.HOLD_AFTER);
      } else {
        this.twTimeout = setTimeout(() => this.tick(), this.TYPE_SPEED);
      }
    } else {
      // Erasing
      this.charIndex--;
      this.typewriterWord.set(current.slice(0, this.charIndex));

      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.wordIndex = (this.wordIndex + 1) % this.WORDS.length;
        this.twTimeout = setTimeout(() => this.tick(), this.PAUSE_BEFORE);
      } else {
        this.twTimeout = setTimeout(() => this.tick(), this.DELETE_SPEED);
      }
    }
  }

  // ── Dot Grid ─────────────────────────────────────────────────

  private initDotGrid(): void {
    const canvas = this.dotCanvasRef!.nativeElement;
    this.buildGrid(canvas);

    this.resizeObserver = new ResizeObserver(() => this.buildGrid(canvas));
    this.resizeObserver.observe(canvas.parentElement!);

    this.rafId = requestAnimationFrame((ts) => this.drawFrame(ts, canvas));
  }

  private buildGrid(canvas: HTMLCanvasElement): void {
    canvas.width = canvas.parentElement!.offsetWidth;
    canvas.height = canvas.parentElement!.offsetHeight;

    const cols = Math.ceil(canvas.width / this.SPACING) + 2;
    const rows = Math.ceil(canvas.height / this.SPACING) + 2;

    this.dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.dots.push({
          bx: c * this.SPACING,
          by: r * this.SPACING,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          speedX: 0.25 + Math.random() * 0.25,
          speedY: 0.2 + Math.random() * 0.3,
        });
      }
    }
  }

  private drawFrame(ts: number, canvas: HTMLCanvasElement): void {
    if (this.lastTime === null) this.lastTime = ts;
    this.elapsed += (ts - this.lastTime) / 1000;
    this.lastTime = ts;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const d of this.dots) {
      const x = d.bx + Math.sin(this.elapsed * d.speedX + d.phaseX) * this.AMPLITUDE;
      const y = d.by + Math.sin(this.elapsed * d.speedY + d.phaseY) * this.AMPLITUDE;
      ctx.beginPath();
      ctx.arc(x, y, this.DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.BASE_ALPHA})`;
      ctx.fill();
    }

    this.rafId = requestAnimationFrame((t) => this.drawFrame(t, canvas));
  }

  // ── Auth ─────────────────────────────────────────────────────

  onLogin(): void {
    this.loginLoading.set(true);
    setTimeout(() => {
      this.loginLoading.set(false);
      this.authService.setTokens('dummyAuth', 'dummyRefresh');
      this.currentPage.set(1);
      this.startResendTimer();
    }, 800);
    // this.apiService
    //   .post('api/v1/Auth/login', this.getLoginPayload())
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (res: any) => {
    //       this.userId.set(res.data.userId);
    //       this.currentPage.set(1);
    //       this.startResendTimer();
    //     },
    //   });
  }

  onResendCode(): void {
    this.apiService
      .post('api/v1/Auth/resend-otp', {
        userId: this.userId(),
        email: this.loginForm.get('email')?.value,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toast.showSuccess('Code resent successfully!');
          this.startResendTimer();
        },
      });
  }

  private startResendTimer(): void {
    this.resendTimer.set(120);
    this.resendDisabled.set(true);

    this.timerInterval = window.setInterval(() => {
      const t = this.resendTimer();
      if (t > 0) {
        this.resendTimer.set(t - 1);
      } else {
        this.resendDisabled.set(false);
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  navigateToLogin(): void {
    this.currentPage.set(0);
  }

  onOtpChange(event: any): void {
    this.otpValue.set(event.value);
    // if (event.value.length === 6) this.onVerifyOtp();
  }

  onVerifyOtp(): void {
    this.otpLoading.set(true);
    setTimeout(() => {
      this.otpLoading.set(false);
      this.toast.showSuccess('Logged in successfully!');
      this.router.navigate(['/app/dashboard']);
    }, 1000);
    // const userId = this.userId();
    // if (!userId) {
    //   this.toast.showError('Invalid user or email');
    //   return;
    // }
    // this.apiService
    //   .post('api/v1/Auth/verify-otp', {
    //     userId,
    //     otp: this.otpValue(),
    //     currentState: 'CONFIRM_LOGIN_VERIFICATION',
    //   })
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (res: any) => {
    //       this.authService.setTokens(res.data.authToken, res.data.refreshToken);
    //       this.toast.showSuccess('Logged in successfully!');
    //       this.router.navigate(['/app/dashboard']);
    //     },
    //   });
  }

  getResendButtonLabel(): string {
    return this.resendDisabled()
      ? `Resend Code (${Math.floor(this.resendTimer() / 60)}:${(this.resendTimer() % 60).toString().padStart(2, '0')})`
      : 'Resend Code';
  }

  getLoginPayload(): any {
    return {
      emailId: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };
  }
}
