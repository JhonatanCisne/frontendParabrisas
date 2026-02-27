import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-gray-900">
      <mat-card class="w-full max-w-md shadow-2xl">
        <mat-card-content>
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Parabrisas Cisneros</h1>
            <p class="text-gray-600">Sistema de Gestión</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-6">
            <mat-form-field class="w-full">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput type="email" formControlName="correo" placeholder="correo@example.com" required />
              <mat-error *ngIf="loginForm.get('correo')?.hasError('required')">
                El correo es requerido
              </mat-error>
              <mat-error *ngIf="loginForm.get('correo')?.hasError('email')">
                Ingrese un correo válido
              </mat-error>
            </mat-form-field>

            <mat-form-field class="w-full">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="contrasena" placeholder="••••••••" required />
              <mat-error *ngIf="loginForm.get('contrasena')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!loginForm.valid || isLoading"
              class="w-full py-3 font-semibold"
            >
              <span *ngIf="!isLoading">Iniciar Sesión</span>
              <mat-spinner *ngIf="isLoading" diameter="24" class="inline-block"></mat-spinner>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      mat-card {
        border-radius: 8px;
      }

      mat-form-field {
        margin-bottom: 1rem;
      }

      button:disabled {
        opacity: 0.6;
      }
    `
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

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
