import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <!-- Left Panel - Branding -->
      <div class="login-branding">
        <div class="branding-content">
          <div class="brand-logo">
            <mat-icon>directions_car</mat-icon>
          </div>
          <h1 class="brand-title">Parabrisas Cisneros</h1>
          <p class="brand-tagline">Sistema de Gestión Empresarial</p>
        </div>
        <div class="branding-footer">
          <p>&copy; 2026 Parabrisas Cisneros. Todos los derechos reservados.</p>
        </div>
      </div>

      <!-- Right Panel - Form -->
      <div class="login-form-panel">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput type="email" formControlName="correo" placeholder="correo@example.com" required />
              <mat-icon matPrefix class="field-icon">mail</mat-icon>
              <mat-error *ngIf="loginForm.get('correo')?.hasError('required')">
                El correo es requerido
              </mat-error>
              <mat-error *ngIf="loginForm.get('correo')?.hasError('email')">
                Ingrese un correo válido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="contrasena" placeholder="••••••••" required />
              <mat-icon matPrefix class="field-icon">lock</mat-icon>
              <mat-error *ngIf="loginForm.get('contrasena')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="isLoading"
              class="login-btn"
            >
              <span *ngIf="!isLoading">Iniciar Sesión</span>
              <mat-spinner *ngIf="isLoading" diameter="22" class="inline-block"></mat-spinner>
            </button>
          </form>

          <!-- Install PWA Banner -->
          <div *ngIf="showInstallBanner" class="install-banner">
            <div class="install-banner-content">
              <mat-icon class="install-icon">install_mobile</mat-icon>
              <div class="install-text">
                <strong>Instalar App</strong>
                <span>Añade Parabrisas Cisneros a tu pantalla de inicio</span>
              </div>
            </div>
            <div class="install-actions">
              <button mat-stroked-button class="install-dismiss" (click)="dismissInstall()">Ahora no</button>
              <button mat-raised-button color="primary" class="install-accept" (click)="installPwa()">Instalar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        min-height: 100vh;
        background: #f8fafc;
      }

      /* ---- Left Branding Panel ---- */
      .login-branding {
        flex: 0 0 42%;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        position: relative;
        overflow: hidden;
      }

      .login-branding::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
        pointer-events: none;
      }

      .branding-content {
        text-align: center;
        z-index: 1;
      }

      .brand-logo {
        width: 72px;
        height: 72px;
        border-radius: 18px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
      }

      .brand-logo mat-icon {
        color: white;
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .brand-title {
        font-size: 28px;
        font-weight: 700;
        color: #f1f5f9;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
      }

      .brand-tagline {
        font-size: 15px;
        color: #64748b;
        font-weight: 400;
      }

      .branding-footer {
        position: absolute;
        bottom: 24px;
        text-align: center;
        z-index: 1;
      }

      .branding-footer p {
        font-size: 12px;
        color: #475569;
      }

      /* ---- Right Form Panel ---- */
      .login-form-panel {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
      }

      .login-form-wrapper {
        width: 100%;
        max-width: 400px;
      }

      .form-header {
        margin-bottom: 32px;
      }

      .form-header h2 {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 8px;
        letter-spacing: -0.02em;
      }

      .form-header p {
        font-size: 14px;
        color: #64748b;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-icon {
        color: #94a3b8 !important;
        margin-right: 8px;
      }

      .login-btn {
        width: 100%;
        height: 48px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        border-radius: 10px !important;
        margin-top: 8px;
        letter-spacing: 0.01em;
      }

      /* Install Banner */
      .install-banner {
        margin-top: 24px;
        padding: 16px;
        background: linear-gradient(135deg, #eff6ff, #dbeafe);
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .install-banner-content {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .install-icon {
        color: #2563eb;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .install-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .install-text strong {
        font-size: 14px;
        color: #1e40af;
      }

      .install-text span {
        font-size: 12px;
        color: #3b82f6;
      }

      .install-actions {
        display: flex;
        gap: 8px;
      }

      .install-dismiss {
        flex: 1;
        font-size: 13px !important;
        border-radius: 8px !important;
      }

      .install-accept {
        flex: 1;
        font-size: 13px !important;
        border-radius: 8px !important;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .login-container {
          flex-direction: column;
        }

        .login-branding {
          flex: 0 0 auto;
          padding: 40px 24px;
        }

        .brand-logo {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          margin-bottom: 16px;
        }

        .brand-logo mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        .brand-title {
          font-size: 22px;
        }

        .branding-footer {
          display: none;
        }

        .login-form-panel {
          padding: 32px 24px;
        }
      }
    `
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  showInstallBanner = false;
  private deferredPrompt: any = null;
  private boundBeforeInstall: ((e: Event) => void) | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Listen for PWA install prompt
    this.boundBeforeInstall = (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      // Only show if user hasn't dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        this.showInstallBanner = true;
      }
    };
    window.addEventListener('beforeinstallprompt', this.boundBeforeInstall);
  }

  ngOnDestroy(): void {
    if (this.boundBeforeInstall) {
      window.removeEventListener('beforeinstallprompt', this.boundBeforeInstall);
    }
  }

  installPwa(): void {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choice: any) => {
      if (choice.outcome === 'accepted') {
        this.snackBar.open('¡App instalada correctamente!', 'Cerrar', {
          duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['success-snackbar']
        });
      }
      this.deferredPrompt = null;
      this.showInstallBanner = false;
    });
  }

  dismissInstall(): void {
    this.showInstallBanner = false;
    this.deferredPrompt = null;
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setTimeout(() => {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed && Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }, 0);
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('¡Sesión iniciada correctamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error de login:', error);
        this.snackBar.open('Error al iniciar sesión. Verifique sus credenciales.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
