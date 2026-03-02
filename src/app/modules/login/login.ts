// // // // import {
// // // //   Component,
// // // //   signal,
// // // //   computed,
// // // //   inject,
// // // //   DestroyRef,
// // // //   AfterViewInit,
// // // //   OnDestroy,
// // // //   ViewChild,
// // // //   ElementRef,
// // // //   NgZone,
// // // // } from '@angular/core';
// // // // import {
// // // //   FormBuilder,
// // // //   FormGroup,
// // // //   FormsModule,
// // // //   ReactiveFormsModule,
// // // //   Validators,
// // // // } from '@angular/forms';
// // // // import { ButtonModule } from 'primeng/button';
// // // // import { CarouselModule } from 'primeng/carousel';
// // // // import { IftaLabelModule } from 'primeng/iftalabel';
// // // // import { InputTextModule } from 'primeng/inputtext';
// // // // import { PasswordModule } from 'primeng/password';
// // // // import { InputOtpModule } from 'primeng/inputotp';
// // // // import { CommonModule } from '@angular/common';
// // // // import { ToastService } from '../core/services/toast';
// // // // import { ThemeService } from '../core/services/theme';
// // // // import { Router } from '@angular/router';
// // // // import { ApiService } from '../shared/services/api.service';
// // // // import { AuthService } from '../core/services/auth-service';
// // // // import { takeUntil } from 'rxjs';
// // // // import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// // // // interface Dot {
// // // //   bx: number;
// // // //   by: number;
// // // //   phaseX: number;
// // // //   phaseY: number;
// // // //   speedX: number;
// // // //   speedY: number;
// // // // }

// // // // @Component({
// // // //   selector: 'app-login',
// // // //   imports: [
// // // //     InputTextModule,
// // // //     IftaLabelModule,
// // // //     ButtonModule,
// // // //     PasswordModule,
// // // //     ReactiveFormsModule,
// // // //     CarouselModule,
// // // //     CommonModule,
// // // //     InputOtpModule,
// // // //     FormsModule,
// // // //   ],
// // // //   templateUrl: './login.html',
// // // //   styleUrl: './login.scss',
// // // // })
// // // // export class Login implements AfterViewInit, OnDestroy {
// // // //   @ViewChild('dotCanvas') dotCanvasRef?: ElementRef<HTMLCanvasElement>;

// // // //   destroyRef = inject(DestroyRef);

// // // //   private ngZone = inject(NgZone);

// // // //   loginForm: FormGroup;
// // // //   otpForm: FormGroup;
// // // //   loginLoading = signal(false);
// // // //   otpLoading = signal(false);
// // // //   currentPage = signal(0);
// // // //   otpValue = signal('');
// // // //   resendTimer = signal(120);
// // // //   resendDisabled = signal(true);

// // // //   userId = signal<number | null>(null);

// // // //   // Typewriter
// // // //   typewriterWord = signal('effortlessly.');

// // // //   private timerInterval?: number;
// // // //   private rafId?: number;
// // // //   private resizeObserver?: ResizeObserver;
// // // //   private twTimeout?: ReturnType<typeof setTimeout>;

// // // //   private readonly WORDS = [
// // // //     'effortlessly.',
// // // //     'efficiently.',
// // // //     'intelligently.',
// // // //     'seamlessly.',
// // // //     'confidently.',
// // // //   ];
// // // //   private readonly TYPE_SPEED = 120;
// // // //   private readonly DELETE_SPEED = 50;
// // // //   private readonly HOLD_AFTER = 2000;
// // // //   private readonly PAUSE_BEFORE = 280;

// // // //   private wordIndex = 0;
// // // //   private charIndex = 0;
// // // //   private isDeleting = false;

// // // //   // Dot grid
// // // //   private readonly SPACING = 28;
// // // //   private readonly DOT_RADIUS = 0.9;
// // // //   private readonly AMPLITUDE = 3.5;
// // // //   private readonly BASE_ALPHA = 0.06;

// // // //   private dots: Dot[] = [];
// // // //   private elapsed = 0;
// // // //   private lastTime: number | null = null;

// // // //   forms = computed(() =>
// // // //     this.currentPage() === 0 ? [{ type: 'login' }] : [{ type: 'login' }, { type: 'otp' }],
// // // //   );

// // // //   constructor(
// // // //     private fb: FormBuilder,
// // // //     private toast: ToastService,
// // // //     private router: Router,
// // // //     private apiService: ApiService,
// // // //     private authService: AuthService,
// // // //     public themeService: ThemeService,
// // // //   ) {
// // // //     this.loginForm = this.fb.group({
// // // //       email: ['', [Validators.required, Validators.email]],
// // // //       password: ['', Validators.required],
// // // //     });
// // // //     this.otpForm = this.fb.group({
// // // //       otp: ['', [Validators.required, Validators.minLength(6)]],
// // // //     });
// // // //   }

// // // //   ngAfterViewInit(): void {
// // // //     // Typewriter runs inside the zone so signals trigger CD normally
// // // //     this.startTypewriter();

// // // //     // Dot grid RAF runs outside the zone — only canvas draws, no CD needed
// // // //     if (this.dotCanvasRef?.nativeElement) {
// // // //       this.ngZone.runOutsideAngular(() => this.initDotGrid());
// // // //     }
// // // //   }

// // // //   ngOnDestroy(): void {
// // // //     if (this.twTimeout) clearTimeout(this.twTimeout);
// // // //     if (this.timerInterval) clearInterval(this.timerInterval);
// // // //     if (this.rafId) cancelAnimationFrame(this.rafId);
// // // //     if (this.resizeObserver) this.resizeObserver.disconnect();
// // // //   }

// // // //   // ── Typewriter ────────────────────────────────────────────────

// // // //   private startTypewriter(): void {
// // // //     this.wordIndex = 0;
// // // //     this.charIndex = this.WORDS[0].length; // first word already shown
// // // //     this.isDeleting = true; // start by erasing the first word after the hold
// // // //     this.twTimeout = setTimeout(() => this.tick(), this.HOLD_AFTER);
// // // //   }

// // // //   private tick(): void {
// // // //     const current = this.WORDS[this.wordIndex];

// // // //     if (!this.isDeleting) {
// // // //       // Typing forward
// // // //       this.charIndex++;
// // // //       this.typewriterWord.set(current.slice(0, this.charIndex));

// // // //       if (this.charIndex === current.length) {
// // // //         this.isDeleting = true;
// // // //         this.twTimeout = setTimeout(() => this.tick(), this.HOLD_AFTER);
// // // //       } else {
// // // //         this.twTimeout = setTimeout(() => this.tick(), this.TYPE_SPEED);
// // // //       }
// // // //     } else {
// // // //       // Erasing
// // // //       this.charIndex--;
// // // //       this.typewriterWord.set(current.slice(0, this.charIndex));

// // // //       if (this.charIndex === 0) {
// // // //         this.isDeleting = false;
// // // //         this.wordIndex = (this.wordIndex + 1) % this.WORDS.length;
// // // //         this.twTimeout = setTimeout(() => this.tick(), this.PAUSE_BEFORE);
// // // //       } else {
// // // //         this.twTimeout = setTimeout(() => this.tick(), this.DELETE_SPEED);
// // // //       }
// // // //     }
// // // //   }

// // // //   // ── Dot Grid ─────────────────────────────────────────────────

// // // //   private initDotGrid(): void {
// // // //     const canvas = this.dotCanvasRef!.nativeElement;
// // // //     this.buildGrid(canvas);

// // // //     this.resizeObserver = new ResizeObserver(() => this.buildGrid(canvas));
// // // //     this.resizeObserver.observe(canvas.parentElement!);

// // // //     this.rafId = requestAnimationFrame((ts) => this.drawFrame(ts, canvas));
// // // //   }

// // // //   private buildGrid(canvas: HTMLCanvasElement): void {
// // // //     canvas.width = canvas.parentElement!.offsetWidth;
// // // //     canvas.height = canvas.parentElement!.offsetHeight;

// // // //     const cols = Math.ceil(canvas.width / this.SPACING) + 2;
// // // //     const rows = Math.ceil(canvas.height / this.SPACING) + 2;

// // // //     this.dots = [];
// // // //     for (let r = 0; r < rows; r++) {
// // // //       for (let c = 0; c < cols; c++) {
// // // //         this.dots.push({
// // // //           bx: c * this.SPACING,
// // // //           by: r * this.SPACING,
// // // //           phaseX: Math.random() * Math.PI * 2,
// // // //           phaseY: Math.random() * Math.PI * 2,
// // // //           speedX: 0.25 + Math.random() * 0.25,
// // // //           speedY: 0.2 + Math.random() * 0.3,
// // // //         });
// // // //       }
// // // //     }
// // // //   }

// // // //   private drawFrame(ts: number, canvas: HTMLCanvasElement): void {
// // // //     if (this.lastTime === null) this.lastTime = ts;
// // // //     this.elapsed += (ts - this.lastTime) / 1000;
// // // //     this.lastTime = ts;

// // // //     const ctx = canvas.getContext('2d')!;
// // // //     ctx.clearRect(0, 0, canvas.width, canvas.height);

// // // //     for (const d of this.dots) {
// // // //       const x = d.bx + Math.sin(this.elapsed * d.speedX + d.phaseX) * this.AMPLITUDE;
// // // //       const y = d.by + Math.sin(this.elapsed * d.speedY + d.phaseY) * this.AMPLITUDE;
// // // //       ctx.beginPath();
// // // //       ctx.arc(x, y, this.DOT_RADIUS, 0, Math.PI * 2);
// // // //       ctx.fillStyle = `rgba(255,255,255,${this.BASE_ALPHA})`;
// // // //       ctx.fill();
// // // //     }

// // // //     this.rafId = requestAnimationFrame((t) => this.drawFrame(t, canvas));
// // // //   }

// // // //   // ── Auth ─────────────────────────────────────────────────────

// // // //   onLogin(): void {
// // // //     // this.loginLoading.set(true);
// // // //     // setTimeout(() => {
// // // //     //   this.loginLoading.set(false);
// // // //     //   this.authService.setTokens('dummyAuth', 'dummyRefresh');
// // // //     //   this.currentPage.set(1);
// // // //     //   this.startResendTimer();
// // // //     // }, 800);
// // // //     this.apiService
// // // //       .post('api/v1/Auth/login', this.getLoginPayload())
// // // //       .pipe(takeUntilDestroyed(this.destroyRef))
// // // //       .subscribe({
// // // //         next: (res: any) => {
// // // //           this.userId.set(res.data.userId);
// // // //           this.currentPage.set(1);
// // // //           this.startResendTimer();
// // // //         },
// // // //       });
// // // //   }

// // // //   onResendCode(): void {
// // // //     this.apiService
// // // //       .post('api/v1/Auth/resend-otp', {
// // // //         userId: this.userId(),
// // // //         email: this.loginForm.get('email')?.value,
// // // //       })
// // // //       .pipe(takeUntilDestroyed(this.destroyRef))
// // // //       .subscribe({
// // // //         complete: () => {
// // // //           this.toast.showSuccess('Code resent successfully!');
// // // //           this.startResendTimer();
// // // //         },
// // // //       });
// // // //   }

// // // //   private startResendTimer(): void {
// // // //     this.resendTimer.set(120);
// // // //     this.resendDisabled.set(true);

// // // //     this.timerInterval = window.setInterval(() => {
// // // //       const t = this.resendTimer();
// // // //       if (t > 0) {
// // // //         this.resendTimer.set(t - 1);
// // // //       } else {
// // // //         this.resendDisabled.set(false);
// // // //         clearInterval(this.timerInterval);
// // // //       }
// // // //     }, 1000);
// // // //   }

// // // //   navigateToLogin(): void {
// // // //     this.currentPage.set(0);
// // // //   }

// // // //   onOtpChange(event: any): void {
// // // //     this.otpValue.set(event.value);
// // // //     // if (event.value.length === 6) this.onVerifyOtp();
// // // //   }

//  onVerifyOtp(): void {
//    const userId = this.userId();
//    if (!userId) {
//      this.toast.showError('Invalid user or email');
//      return;
//    }
//    this.apiService
//      .post('api/v1/Auth/verify-otp', {
//        userId,
//        otp: this.otpValue(),
//        currentState: 'CONFIRM_LOGIN_VERIFICATION',
//      })
//      .pipe(takeUntilDestroyed(this.destroyRef))
//      .subscribe({
//        next: (res: any) => {
//          this.authService.setTokens(res.data.authToken, res.data.refreshToken);
//          this.toast.showSuccess('Logged in successfully!');
//          this.router.navigate(['/app/dashboard']);
//        },
//      });
//  }

// // // //   getResendButtonLabel(): string {
// // // //     return this.resendDisabled()
// // // //       ? `Resend Code (${Math.floor(this.resendTimer() / 60)}:${(this.resendTimer() % 60).toString().padStart(2, '0')})`
// // // //       : 'Resend Code';
// // // //   }

// // // //   getLoginPayload(): any {
// // // //     return {
// // // //       emailId: this.loginForm.get('email')?.value,
// // // //       password: this.loginForm.get('password')?.value,
// // // //     };
// // // //   }
// // // // }
// // // import {
// // //   Component,
// // //   OnInit,
// // //   OnDestroy,
// // //   signal,
// // //   inject,
// // //   ChangeDetectionStrategy,
// // // } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// // // import { Router } from '@angular/router';

// // // // PrimeNG
// // // import { ButtonModule } from 'primeng/button';
// // // import { InputTextModule } from 'primeng/inputtext';
// // // import { PasswordModule } from 'primeng/password';
// // // import { InputOtpModule } from 'primeng/inputotp';

// // // // Services (adjust paths to match your project)
// // // // import { AuthService }  from '@core/auth/auth.service';
// // // // import { ToastService } from '@core/toast/toast.service';

// // // export interface RightSlide {
// // //   id: number;
// // //   title: string;
// // //   sub: string;
// // // }

// // // export interface RightFeature {
// // //   icon: string;
// // //   label: string;
// // // }

// // // @Component({
// // //   selector: 'app-login',
// // //   standalone: true,
// // //   imports: [
// // //     CommonModule,
// // //     ReactiveFormsModule,
// // //     ButtonModule,
// // //     InputTextModule,
// // //     PasswordModule,
// // //     InputOtpModule,
// // //   ],
// // //   templateUrl: './login.html',
// // //   styleUrl: './login.scss',
// // //   changeDetection: ChangeDetectionStrategy.OnPush,
// // // })
// // // export class Login implements OnInit, OnDestroy {
// // //   private readonly fb = inject(FormBuilder);
// // //   // private readonly auth  = inject(AuthService);
// // //   // private readonly toast = inject(ToastService);
// // //   private readonly router = inject(Router);

// // //   // ── Page state ──────────────────────────────────────────────────
// // //   currentPage = signal(0); // 0 = login, 1 = OTP

// // //   // ── Loading states ───────────────────────────────────────────────
// // //   loginLoading = signal(false);
// // //   otpLoading = signal(false);

// // //   // ── Resend countdown ─────────────────────────────────────────────
// // //   resendDisabled = signal(true);
// // //   resendCountdown = signal(30);
// // //   private resendTimer?: ReturnType<typeof setInterval>;

// // //   // ── Forms ────────────────────────────────────────────────────────
// // //   loginForm = this.fb.group({
// // //     email: ['', [Validators.required, Validators.email]],
// // //     password: ['', [Validators.required, Validators.minLength(6)]],
// // //   });

// // //   otpForm = this.fb.group({
// // //     otp: ['', [Validators.required, Validators.minLength(6)]],
// // //   });

// // //   // ── Right panel slides ───────────────────────────────────────────
// // //   readonly rightSlides: RightSlide[] = [
// // //     {
// // //       id: 0,
// // //       title: 'Manage funds\nwith precision',
// // //       sub: 'Track invoices, approvals, and cashflows across all portfolios in one place.',
// // //     },
// // //     {
// // //       id: 1,
// // //       title: 'Automate\napproval workflows',
// // //       sub: 'Multi-level approvals with real-time status tracking and instant notifications.',
// // //     },
// // //     {
// // //       id: 2,
// // //       title: 'Full audit\ntrail built-in',
// // //       sub: 'Every action is logged with timestamps, users, and change history for compliance.',
// // //     },
// // //     {
// // //       id: 3,
// // //       title: 'Reporting\nat your fingertips',
// // //       sub: 'Export tax reports, cash balance summaries, and reconciliation files in one click.',
// // //     },
// // //   ];

// // //   readonly rightFeatures: RightFeature[] = [
// // //     { icon: 'pi-file-plus', label: 'Invoice processing' },
// // //     { icon: 'pi-check-square', label: 'Approval workflows' },
// // //     { icon: 'pi-chart-bar', label: 'Financial reporting' },
// // //   ];

// // //   // ── Right panel auto-slide ────────────────────────────────────────
// // //   currentSlide = signal(0);
// // //   private slideTimer?: ReturnType<typeof setInterval>;

// // //   ngOnInit(): void {
// // //     this.startSlideTimer();
// // //   }

// // //   ngOnDestroy(): void {
// // //     clearInterval(this.slideTimer);
// // //     clearInterval(this.resendTimer);
// // //   }

// // //   // ── Slide controls ───────────────────────────────────────────────
// // //   private startSlideTimer(): void {
// // //     this.slideTimer = setInterval(() => {
// // //       this.currentSlide.update((s) => (s + 1) % this.rightSlides.length);
// // //     }, 4000);
// // //   }

// // //   setSlide(index: number): void {
// // //     clearInterval(this.slideTimer);
// // //     this.currentSlide.set(index);
// // //     this.startSlideTimer();
// // //   }

// // //   // ── Form actions ─────────────────────────────────────────────────
// // //   onLogin(): void {
// // //     if (!this.loginForm.valid) return;
// // //     this.loginLoading.set(true);

// // //     // Replace with real auth call:
// // //     // this.auth.login(email, password).subscribe({...})
// // //     setTimeout(() => {
// // //       this.loginLoading.set(false);
// // //       this.currentPage.set(1); // advance to OTP
// // //       this.startResendCountdown();
// // //     }, 1200);
// // //   }

// // //   onVerifyOtp(): void {
// // //     if (this.otpForm.invalid) return;
// // //     this.otpLoading.set(true);

// // //     // Replace with real OTP verify:
// // //     // this.auth.verifyOtp(code).subscribe({...})
// // //     setTimeout(() => {
// // //       this.otpLoading.set(false);
// // //       this.router.navigate(['/dashboard']);
// // //     }, 1000);
// // //   }

// // //   onOtpChange(_event: unknown): void {
// // //     // Optionally auto-submit when all 6 digits entered
// // //   }

// // //   onResendCode(): void {
// // //     // this.auth.resendOtp().subscribe(...)
// // //     this.startResendCountdown();
// // //   }

// // //   navigateToLogin(): void {
// // //     clearInterval(this.resendTimer);
// // //     this.otpForm.reset();
// // //     this.currentPage.set(0);
// // //   }

// // //   getResendButtonLabel(): string {
// // //     return this.resendDisabled() ? `Resend in ${this.resendCountdown()}s` : 'Resend code';
// // //   }

// // //   // ── Resend countdown ─────────────────────────────────────────────
// // //   private startResendCountdown(): void {
// // //     clearInterval(this.resendTimer);
// // //     this.resendDisabled.set(true);
// // //     this.resendCountdown.set(30);

// // //     this.resendTimer = setInterval(() => {
// // //       const next = this.resendCountdown() - 1;
// // //       this.resendCountdown.set(next);
// // //       if (next <= 0) {
// // //         clearInterval(this.resendTimer);
// // //         this.resendDisabled.set(false);
// // //       }
// // //     }, 1000);
// // //   }
// // // }

// // import {
// //   Component,
// //   OnInit,
// //   OnDestroy,
// //   signal,
// //   inject,
// //   ChangeDetectionStrategy,
// // } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// // import { Router } from '@angular/router';

// // // PrimeNG
// // import { ButtonModule } from 'primeng/button';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { PasswordModule } from 'primeng/password';
// // import { InputOtpModule } from 'primeng/inputotp';

// // // ── Slide types ───────────────────────────────────────────────────
// // export type SlideIconId = 'chart' | 'ai' | 'workflow' | 'audit';

// // export interface PanelSlide {
// //   id: number;
// //   iconId: SlideIconId;
// //   title: string; // \n → whitespace-pre-line in template
// //   sub: string;
// // }

// // export interface PanelFeature {
// //   icon: string;
// //   label: string;
// // }

// // // Must match $slide-duration in SCSS
// // const SLIDE_DURATION_MS = 480;

// // @Component({
// //   selector: 'app-login',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     ReactiveFormsModule,
// //     ButtonModule,
// //     InputTextModule,
// //     PasswordModule,
// //     InputOtpModule,
// //   ],
// //   templateUrl: './login.html',
// //   styleUrl: './login.scss',
// //   changeDetection: ChangeDetectionStrategy.OnPush,
// // })
// // export class Login implements OnInit, OnDestroy {
// //   private readonly fb = inject(FormBuilder);
// //   private readonly router = inject(Router);

// //   // ── Page state ──────────────────────────────────────────────────
// //   currentPage = signal(0); // 0 = login  |  1 = OTP
// //   loginLoading = signal(false);
// //   otpLoading = signal(false);
// //   resendDisabled = signal(true);
// //   resendCountdown = signal(30);

// //   // ── Forms ────────────────────────────────────────────────────────
// //   loginForm = this.fb.group({
// //     email: ['', [Validators.required, Validators.email]],
// //     password: ['', [Validators.required, Validators.minLength(6)]],
// //   });

// //   otpForm = this.fb.group({
// //     otp: ['', [Validators.required, Validators.minLength(6)]],
// //   });

// //   // ── Left panel slides ─────────────────────────────────────────────
// //   readonly rightSlides: PanelSlide[] = [
// //     {
// //       id: 0,
// //       iconId: 'chart',
// //       title: 'Manage funds\nwith precision',
// //       sub: 'Track invoices, approvals, and cashflows across all portfolios in one place.',
// //     },
// //     {
// //       id: 1,
// //       iconId: 'ai',
// //       title: 'AI-powered\ninvoice extraction',
// //       sub: 'Upload any PDF invoice — our AI reads vendor details, amounts, and line items automatically. No manual entry.',
// //     },
// //     {
// //       id: 2,
// //       iconId: 'workflow',
// //       title: 'Automate\napproval workflows',
// //       sub: 'Multi-level approvals with configurable routing rules, live status tracking, and instant notifications.',
// //     },
// //     {
// //       id: 3,
// //       iconId: 'audit',
// //       title: 'Full audit\ntrail built-in',
// //       sub: 'Every action logged with timestamps, user IDs, and change history — full compliance visibility.',
// //     },
// //   ];

// //   readonly rightFeatures: PanelFeature[] = [
// //     { icon: 'pi-file-plus', label: 'Invoice processing' },
// //     { icon: 'pi-sparkles', label: 'AI extraction' },
// //     { icon: 'pi-chart-bar', label: 'Fund reporting' },
// //   ];

// //   // ── Slide transition state ────────────────────────────────────────
// //   /**
// //    * displaySlide — index of the slide playing its ENTER animation.
// //    * exitSlide    — index of the slide playing its EXIT animation (-1 = none).
// //    *
// //    * Both live in the DOM at the same time during a transition so the
// //    * outgoing slide can animate → right while the incoming arrives ← left.
// //    */
// //   displaySlide = signal(0);
// //   exitSlide = signal(-1);

// //   private slideTimer?: ReturnType<typeof setInterval>;
// //   private resendTimer?: ReturnType<typeof setInterval>;

// //   // ── Lifecycle ─────────────────────────────────────────────────────
// //   ngOnInit(): void {
// //     this.startSlideTimer();
// //   }
// //   ngOnDestroy(): void {
// //     clearInterval(this.slideTimer);
// //     clearInterval(this.resendTimer);
// //   }

// //   // ── Slide helpers ─────────────────────────────────────────────────
// //   private startSlideTimer(): void {
// //     this.slideTimer = setInterval(() => {
// //       this.advanceTo((this.displaySlide() + 1) % this.rightSlides.length);
// //     }, 4800);
// //   }

// //   setSlide(index: number): void {
// //     if (index === this.displaySlide()) return;
// //     clearInterval(this.slideTimer);
// //     this.advanceTo(index);
// //     this.startSlideTimer();
// //   }

// //   private advanceTo(next: number): void {
// //     this.exitSlide.set(this.displaySlide()); // outgoing → play exit CSS
// //     this.displaySlide.set(next); // incoming → play enter CSS
// //     setTimeout(() => this.exitSlide.set(-1), SLIDE_DURATION_MS);
// //   }

// //   // ── Form actions ──────────────────────────────────────────────────
// //   onLogin(): void {
// //     if (!this.loginForm.valid) return;
// //     this.loginLoading.set(true);
// //     setTimeout(() => {
// //       this.loginLoading.set(false);
// //       this.currentPage.set(1);
// //       this.startResendCountdown();
// //     }, 1200);
// //   }

// //   onVerifyOtp(): void {
// //     if (this.otpForm.invalid) return;
// //     this.otpLoading.set(true);
// //     setTimeout(() => {
// //       this.otpLoading.set(false);
// //       this.router.navigate(['/dashboard']);
// //     }, 1000);
// //   }

// //   onOtpChange(_event: unknown): void {}

// //   onResendCode(): void {
// //     this.startResendCountdown();
// //   }

// //   navigateToLogin(): void {
// //     clearInterval(this.resendTimer);
// //     this.otpForm.reset();
// //     this.currentPage.set(0);
// //   }

// //   getResendButtonLabel(): string {
// //     return this.resendDisabled() ? `Resend in ${this.resendCountdown()}s` : 'Resend code';
// //   }

// //   private startResendCountdown(): void {
// //     clearInterval(this.resendTimer);
// //     this.resendDisabled.set(true);
// //     this.resendCountdown.set(30);
// //     this.resendTimer = setInterval(() => {
// //       const n = this.resendCountdown() - 1;
// //       this.resendCountdown.set(n);
// //       if (n <= 0) {
// //         clearInterval(this.resendTimer);
// //         this.resendDisabled.set(false);
// //       }
// //     }, 1000);
// //   }
// // }
// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   signal,
//   inject,
//   ChangeDetectionStrategy,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { PasswordModule } from 'primeng/password';
// import { InputOtpModule } from 'primeng/inputotp';

// export type SlideIconId = 'chart' | 'ai' | 'workflow' | 'audit';

// export interface PanelSlide {
//   id: number;
//   iconId: SlideIconId;
//   title: string; // \n preserved via whitespace-pre-line
//   sub: string;
// }

// export interface PanelFeature {
//   icon: string;
//   label: string;
// }

// const EXIT_REMOVE_MS = 500; // must be >= exit animation duration in SCSS

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     ButtonModule,
//     InputTextModule,
//     PasswordModule,
//     InputOtpModule,
//   ],
//   templateUrl: './login.html',
//   styleUrl: './login.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class Login implements OnInit, OnDestroy {
//   private readonly fb = inject(FormBuilder);
//   private readonly router = inject(Router);

//   currentPage = signal(0);
//   loginLoading = signal(false);
//   otpLoading = signal(false);
//   resendDisabled = signal(true);
//   resendCountdown = signal(30);

//   loginForm = this.fb.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(6)]],
//   });
//   otpForm = this.fb.group({
//     otp: ['', [Validators.required, Validators.minLength(6)]],
//   });

//   readonly rightSlides: PanelSlide[] = [
//     {
//       id: 0,
//       iconId: 'chart',
//       title: 'Manage funds\nwith precision',
//       sub: 'Track invoices, approvals, and cashflows across all portfolios in one place.',
//     },
//     {
//       id: 1,
//       iconId: 'ai',
//       title: 'AI-powered\ninvoice extraction',
//       sub: 'Upload any PDF — our AI reads vendor details, amounts, and line items automatically. No manual entry.',
//     },
//     {
//       id: 2,
//       iconId: 'workflow',
//       title: 'Automate\napproval workflows',
//       sub: 'Multi-level approvals with configurable routing rules, live status, and instant notifications.',
//     },
//     {
//       id: 3,
//       iconId: 'audit',
//       title: 'Full audit\ntrail built-in',
//       sub: 'Every action logged with timestamps, user IDs, and change history — complete compliance visibility.',
//     },
//   ];

//   readonly rightFeatures: PanelFeature[] = [
//     { icon: 'pi-file-plus', label: 'Invoice processing' },
//     { icon: 'pi-sparkles', label: 'AI extraction' },
//     { icon: 'pi-chart-bar', label: 'Fund reporting' },
//   ];

//   displaySlide = signal(0); // currently-visible slide index
//   exitSlide = signal(-1); // outgoing slide index (-1 = none)

//   /**
//    * slideKey — increments on every transition.
//    *
//    * WHY THIS FIXES THE ANIMATION:
//    * Angular reuses DOM nodes when the tracked value in @for doesn't change.
//    * Tracking by slide.id fails when the same slide reappears (e.g. 0→1→0).
//    * slideKey always produces a new integer, so Angular ALWAYS destroys the
//    * old enter-wrapper and creates a fresh one → the CSS @keyframe fires
//    * from the start every single time, with no exceptions.
//    */
//   slideKey = signal(0);

//   private slideTimer?: ReturnType<typeof setInterval>;
//   private resendTimer?: ReturnType<typeof setInterval>;

//   ngOnInit(): void {
//     this.startSlideTimer();
//   }
//   ngOnDestroy(): void {
//     clearInterval(this.slideTimer);
//     clearInterval(this.resendTimer);
//   }

//   private startSlideTimer(): void {
//     this.slideTimer = setInterval(
//       () => this.advanceTo((this.displaySlide() + 1) % this.rightSlides.length),
//       4800,
//     );
//   }

//   setSlide(index: number): void {
//     if (index === this.displaySlide()) return;
//     clearInterval(this.slideTimer);
//     this.advanceTo(index);
//     this.startSlideTimer();
//   }

//   private advanceTo(next: number): void {
//     this.exitSlide.set(this.displaySlide()); // creates exit node → CSS exit fires
//     this.displaySlide.set(next);
//     this.slideKey.update((k) => k + 1); // creates fresh enter node → CSS enter fires
//     setTimeout(() => this.exitSlide.set(-1), EXIT_REMOVE_MS);
//   }

//   onLogin(): void {
//     if (!this.loginForm.valid) return;
//     this.loginLoading.set(true);
//     setTimeout(() => {
//       this.loginLoading.set(false);
//       this.currentPage.set(1);
//       this.startResendCountdown();
//     }, 1200);
//   }
//   onVerifyOtp(): void {
//     if (this.otpForm.invalid) return;
//     this.otpLoading.set(true);
//     setTimeout(() => {
//       this.otpLoading.set(false);
//       this.router.navigate(['/dashboard']);
//     }, 1000);
//   }
//   onOtpChange(_e: unknown): void {}
//   onResendCode(): void {
//     this.startResendCountdown();
//   }
//   navigateToLogin(): void {
//     clearInterval(this.resendTimer);
//     this.otpForm.reset();
//     this.currentPage.set(0);
//   }
//   getResendButtonLabel(): string {
//     return this.resendDisabled() ? `Resend in ${this.resendCountdown()}s` : 'Resend code';
//   }
//   private startResendCountdown(): void {
//     clearInterval(this.resendTimer);
//     this.resendDisabled.set(true);
//     this.resendCountdown.set(30);
//     this.resendTimer = setInterval(() => {
//       const n = this.resendCountdown() - 1;
//       this.resendCountdown.set(n);
//       if (n <= 0) {
//         clearInterval(this.resendTimer);
//         this.resendDisabled.set(false);
//       }
//     }, 1000);
//   }
// }
// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   signal,
//   inject,
//   ChangeDetectionStrategy,
//   DestroyRef,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { PasswordModule } from 'primeng/password';
// import { InputOtpModule } from 'primeng/inputotp';
// import { ToastService } from '../core/services/toast';
// import { ApiService } from '../shared/services/api.service';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { AuthService } from '../core/services/auth-service';

// export type SlideIconId = 'chart' | 'ai' | 'workflow' | 'audit';
// export interface PanelSlide {
//   id: number;
//   iconId: SlideIconId;
//   title: string;
//   sub: string;
// }
// export interface PanelFeature {
//   icon: string;
//   label: string;
// }

// // ── Timing constants (keep in sync with SCSS) ──────────────────────
// // Exit: icon + title + sub all slide out → right
// //   each element: 300ms duration, stagger 0 / 60 / 120 ms
// //   last element done at: 300 + 120 = 420ms → wait 460ms to be safe
// const EXIT_DURATION_MS = 460;

// // Enter: elements arrive one by one after exit is fully done
// //   delays defined in SCSS: icon 0ms, title 130ms, sub 260ms
// //   (these are relative to when displaySlide changes)

// // Auto-advance: how long each panel stays fully visible
// const PANEL_VISIBLE_MS = 4000;

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     ButtonModule,
//     InputTextModule,
//     PasswordModule,
//     InputOtpModule,
//   ],
//   templateUrl: './login.html',
//   styleUrl: './login.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class Login implements OnInit, OnDestroy {
//   private destroyRef = inject(DestroyRef);

//   currentPage = signal(0);
//   loginLoading = signal(false);
//   otpLoading = signal(false);
//   resendDisabled = signal(true);
//   resendCountdown = signal(30);

//   private userId = signal<number | null>(null);

//   loginForm: FormGroup;
//   otpForm: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private toastService: ToastService,
//     private router: Router,
//     private apiService: ApiService,
//     private authService: AuthService,
//   ) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//     });
//     this.otpForm = this.fb.group({
//       otp: ['', [Validators.required, Validators.minLength(6)]],
//     });
//   }

//   // loginForm = this.fb.group({
//   //   email: ['', [Validators.required, Validators.email]],
//   //   password: ['', [Validators.required, Validators.minLength(6)]],
//   // });
//   // otpForm = this.fb.group({
//   //   otp: ['', [Validators.required, Validators.minLength(6)]],
//   // });

//   readonly rightSlides: PanelSlide[] = [
//     {
//       id: 0,
//       iconId: 'chart',
//       title: 'Manage funds\nwith precision',
//       sub: 'Track invoices, approvals, and cashflows across all portfolios in one place.',
//     },
//     {
//       id: 1,
//       iconId: 'ai',
//       title: 'AI-powered\ninvoice extraction',
//       sub: 'Upload any PDF — our AI reads vendor, amounts, and line items automatically. No manual entry.',
//     },
//     {
//       id: 2,
//       iconId: 'workflow',
//       title: 'Automate\napproval workflows',
//       sub: 'Multi-level approvals with configurable routing rules, live status, and instant notifications.',
//     },
//     {
//       id: 3,
//       iconId: 'audit',
//       title: 'Full audit\ntrail built-in',
//       sub: 'Every action logged with timestamps, user IDs, and change history — full compliance visibility.',
//     },
//   ];

//   readonly rightFeatures: PanelFeature[] = [
//     { icon: 'pi-file-plus', label: 'Invoice processing' },
//     { icon: 'pi-sparkles', label: 'AI extraction' },
//     { icon: 'pi-chart-bar', label: 'Fund reporting' },
//   ];

//   // ── Slide state ─────────────────────────────────────────────────────
//   displaySlide = signal(0); // which slide is rendered
//   slideKey = signal(0); // increments on enter → forces DOM recreation → CSS fires
//   isExiting = signal(false); // true while exit animation plays

//   private slideTimer?: ReturnType<typeof setInterval>;
//   private exitTimeout?: ReturnType<typeof setTimeout>;
//   private resendTimer?: ReturnType<typeof setInterval>;

//   ngOnInit(): void {
//     this.startSlideTimer();
//   }

//   ngOnDestroy(): void {
//     clearInterval(this.slideTimer);
//     clearTimeout(this.exitTimeout);
//     clearInterval(this.resendTimer);
//   }

//   // ── Slide sequencing ─────────────────────────────────────────────────
//   // Full cycle:
//   //   1. isExiting → true  (CSS exit animation plays: icon→title→sub slide right+fade)
//   //   2. Wait EXIT_DURATION_MS for animation to finish
//   //   3. Update displaySlide + increment slideKey (CSS enter plays: icon→title→sub slide in from left)
//   //   4. isExiting → false

//   private startSlideTimer(): void {
//     this.slideTimer = setInterval(
//       () => {
//         this.advanceTo((this.displaySlide() + 1) % this.rightSlides.length);
//       },
//       PANEL_VISIBLE_MS + EXIT_DURATION_MS + 810,
//     ); // visible + exit + enter
//   }

//   setSlide(index: number): void {
//     if (index === this.displaySlide() || this.isExiting()) return;
//     clearInterval(this.slideTimer);
//     this.advanceTo(index);
//     this.startSlideTimer();
//   }

//   private advanceTo(next: number): void {
//     // Step 1 — trigger exit CSS
//     this.isExiting.set(true);

//     // Step 2 — after exit finishes, swap slide + trigger enter CSS
//     this.exitTimeout = setTimeout(() => {
//       this.displaySlide.set(next);
//       this.slideKey.update((k) => k + 1); // new DOM node → enter keyframe fires
//       this.isExiting.set(false);
//     }, EXIT_DURATION_MS);
//   }

//   // ── Form actions ─────────────────────────────────────────────────────
//   onLogin(): void {
//     if (!this.loginForm.valid) return;
//     this.apiService
//       .post('api/v1/Auth/login', this.getLoginPayload())
//       .pipe(takeUntilDestroyed(this.destroyRef))
//       .subscribe({
//         next: (res: any) => {
//           this.userId.set(res.data.userId);
//           this.currentPage.set(1);
//           this.startResendCountdown();
//         },
//       });
//   }

//   getLoginPayload(): any {
//     return {
//       emailId: this.loginForm.get('email')?.value,
//       password: this.loginForm.get('password')?.value,
//     };
//   }

//   onVerifyOtp(): void {
//     const userId = this.userId();
//     if (!userId) {
//       this.toastService.showError('Please go back and login again.');
//       return;
//     }
//     if (this.otpForm.invalid) {
//       return;
//     }
//     this.apiService
//       .post('api/v1/Auth/verify-otp', {
//         userId,
//         otp: this.otpForm.get('otp')?.value,
//       })
//       .pipe(takeUntilDestroyed(this.destroyRef))
//       .subscribe({
//         next: (res: any) => {
//           this.authService.setTokens(res.data.authToken, res.data.refreshToken);
//           this.toastService.showSuccess('Logged in successfully!');
//           this.router.navigate(['/app/dashboard']);
//         },
//       });
//   }

//   onOtpChange(_e: unknown): void {}

//   onResendCode(): void {
//     this.startResendCountdown();
//   }
//   navigateToLogin(): void {
//     clearInterval(this.resendTimer);
//     this.otpForm.reset();
//     this.currentPage.set(0);
//   }
//   getResendButtonLabel(): string {
//     return this.resendDisabled() ? `Resend in ${this.resendCountdown()}s` : 'Resend code';
//   }
//   private startResendCountdown(): void {
//     clearInterval(this.resendTimer);
//     this.resendDisabled.set(true);
//     this.resendCountdown.set(30);
//     this.resendTimer = setInterval(() => {
//       const n = this.resendCountdown() - 1;
//       this.resendCountdown.set(n);
//       if (n <= 0) {
//         clearInterval(this.resendTimer);
//         this.resendDisabled.set(false);
//       }
//     }, 1000);
//   }
// }

// ─────────────────────────────────────────────────────────────────
// CHANGES TO login.ts — two things:
//   1. Replace `slideKey` signal with `showSlide` signal
//   2. Update `advanceTo()` to use destroy-then-recreate pattern
//
// HOW IT WORKS:
//   isExiting = true   → exit CSS animation plays on existing DOM
//   setTimeout(460ms)  → exit animation finishes
//   showSlide = false  → Angular destroys the @if content (DOM gone)
//   rAF callback       → next browser frame, Angular has flushed
//   displaySlide = N   → update slide data
//   showSlide = true   → Angular recreates @if content with fresh DOM
//   isExiting = false  → element gets .panel-enter → enter CSS fires
//
// This is identical behaviour to the @for slideKey trick but without
// the NG0956 warning, because @if is designed for destroy/recreate.
// ─────────────────────────────────────────────────────────────────

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
import { ToastService } from '../core/services/toast';
import { ApiService } from '../shared/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../core/services/auth-service';

export type SlideIconId = 'chart' | 'ai' | 'workflow' | 'audit';
export interface PanelSlide {
  id: number;
  iconId: SlideIconId;
  title: string;
  sub: string;
}
export interface PanelFeature {
  icon: string;
  label: string;
}

const EXIT_DURATION_MS = 460;
const PANEL_VISIBLE_MS = 4000;

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
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  currentPage = signal(0);
  loginLoading = signal(false);
  otpLoading = signal(false);
  resendDisabled = signal(true);
  resendCountdown = signal(30);

  private userId = signal<number | null>(null);

  loginForm: FormGroup;
  otpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  readonly rightSlides: PanelSlide[] = [
    {
      id: 0,
      iconId: 'chart',
      title: 'Manage funds\nwith precision',
      sub: 'Track invoices, approvals, and cashflows across all portfolios in one place.',
    },
    {
      id: 1,
      iconId: 'ai',
      title: 'AI-powered\ninvoice extraction',
      sub: 'Upload any PDF — our AI reads vendor, amounts, and line items automatically. No manual entry.',
    },
    {
      id: 2,
      iconId: 'workflow',
      title: 'Automate\napproval workflows',
      sub: 'Multi-level approvals with configurable routing rules, live status, and instant notifications.',
    },
    {
      id: 3,
      iconId: 'audit',
      title: 'Full audit\ntrail built-in',
      sub: 'Every action logged with timestamps, user IDs, and change history — full compliance visibility.',
    },
  ];

  readonly rightFeatures: PanelFeature[] = [
    { icon: 'pi-file-plus', label: 'Invoice processing' },
    { icon: 'pi-sparkles', label: 'AI extraction' },
    { icon: 'pi-chart-bar', label: 'Fund reporting' },
  ];

  // ── Slide state ──────────────────────────────────────────────────
  displaySlide = signal(0);
  isExiting = signal(false);

  // ✅ NEW: replaces slideKey — controls @if in the template
  showSlide = signal(true);

  // ❌ REMOVED: slideKey = signal(0);  ← no longer needed

  private slideTimer?: ReturnType<typeof setInterval>;
  private exitTimeout?: ReturnType<typeof setTimeout>;
  private resendTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startSlideTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.slideTimer);
    clearTimeout(this.exitTimeout);
    clearInterval(this.resendTimer);
  }

  private startSlideTimer(): void {
    this.slideTimer = setInterval(
      () => this.advanceTo((this.displaySlide() + 1) % this.rightSlides.length),
      PANEL_VISIBLE_MS + EXIT_DURATION_MS + 810,
    );
  }

  setSlide(index: number): void {
    if (index === this.displaySlide() || this.isExiting()) return;
    clearInterval(this.slideTimer);
    this.advanceTo(index);
    this.startSlideTimer();
  }

  private advanceTo(next: number): void {
    // Step 1 — trigger exit CSS on current DOM node
    this.isExiting.set(true);

    // Step 2 — after exit animation finishes, destroy then recreate
    this.exitTimeout = setTimeout(() => {
      // Destroy the @if content — Angular removes the DOM node
      this.showSlide.set(false);

      // Wait one rAF so Angular flushes the destruction before recreating.
      // rAF fires after the browser has painted the empty state.
      requestAnimationFrame(() => {
        this.displaySlide.set(next); // update data while node is gone
        this.isExiting.set(false); // next render gets .panel-enter
        this.showSlide.set(true); // recreate — fresh DOM, CSS fires
      });
    }, EXIT_DURATION_MS);
  }

  // ── Form actions ─────────────────────────────────────────────────
  onLogin(): void {
    if (!this.loginForm.valid) return;
    this.apiService
      .post('api/v1/Auth/login', this.getLoginPayload())
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
    if (!userId) {
      this.toastService.showError('Please go back and login again.');
      return;
    }
    if (this.otpForm.invalid) return;
    this.apiService
      .post('api/v1/Auth/verify-otp', {
        userId,
        otp: this.otpForm.get('otp')?.value,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.authService.setTokens(res.data.authToken, res.data.refreshToken);
          this.toastService.showSuccess('Logged in successfully!');
          this.router.navigate(['/app/dashboard']);
        },
      });
  }

  onOtpChange(_e: unknown): void {}

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
}
