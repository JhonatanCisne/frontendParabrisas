import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService } from './services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioDTO } from '../../shared/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <div>
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div class="flex items-center gap-3">
          <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <mat-icon style="color:white;font-size:22px;width:22px;height:22px">people</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="letter-spacing:-0.02em">Usuarios</h1>
            <p class="text-sm text-slate-500 mt-0.5">Administra los usuarios del sistema</p>
          </div>
        </div>
        <button mat-raised-button color="primary" (click)="openDialog()" class="w-full md:w-auto">
          <mat-icon class="mr-1">add</mat-icon>
          Nuevo Usuario
        </button>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div *ngIf="isLoading" class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!isLoading && usuarios.length > 0" class="overflow-x-auto">
          <table mat-table [dataSource]="usuarios">
            <ng-container matColumnDef="nombres">
              <th mat-header-cell *matHeaderCellDef class="bg-slate-50">
                Nombre
              </th>
              <td mat-cell *matCellDef="let element" class="font-medium text-slate-900">{{ element.nombres }} {{ element.apellidos }}</td>
            </ng-container>

            <ng-container matColumnDef="correo">
              <th mat-header-cell *matHeaderCellDef class="bg-slate-50">
                Correo
              </th>
              <td mat-cell *matCellDef="let element" class="text-slate-600">{{ element.correo }}</td>
            </ng-container>

            <ng-container matColumnDef="rol">
              <th mat-header-cell *matHeaderCellDef class="bg-slate-50">
                Rol
              </th>
              <td mat-cell *matCellDef="let element">
                <span class="px-3 py-1 rounded-full text-xs font-semibold" [ngClass]="getRolClass(element.rol)">
                  {{ element.rol }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="bg-slate-50">
                Acciones
              </th>
              <td mat-cell *matCellDef="let element">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="editarUsuario(element)"
                  [disabled]="esUsuarioActual(element)"
                  [matTooltip]="esUsuarioActual(element) ? 'No puedes editar tu propio usuario' : 'Editar'"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="eliminarUsuario(element.correo)"
                  [disabled]="esUsuarioActual(element)"
                  [matTooltip]="esUsuarioActual(element) ? 'No puedes eliminar tu propio usuario' : 'Eliminar'"
                >
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div *ngIf="!isLoading && usuarios.length === 0" class="py-12 text-center text-slate-400 text-sm">
          <mat-icon style="font-size:40px;width:40px;height:40px;opacity:0.4" class="mb-2">people</mat-icon>
          <p>No hay usuarios registrados. Usa el botón "Nuevo Usuario" para crear uno.</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      table {
        width: 100%;
      }

      th {
        padding: 0.875rem 1rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
      }

      td {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid #f1f5f9;
      }

      tr:hover td {
        background-color: #f8fafc;
      }
    `
  ]
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  currentUserCorreo = '';
  isLoading = false;
  displayedColumns: string[] = ['nombres', 'correo', 'rol', 'acciones'];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserCorreo = (user?.correo || '').toLowerCase();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data.filter(
          (u) => (u.correo || '').toLowerCase() !== this.currentUserCorreo && !this.esRolAdmin(u.rol)
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 5000 });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDialog(): void {
    this.dialog.open(UsuarioFormDialogComponent, {
      width: '600px',
      data: { usuario: null }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.agregarUsuarioALista(result);
        this.snackBar.open('Usuario creado correctamente: ' + result.nombres + ' ' + result.apellidos, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  editarUsuario(usuario: UsuarioDTO): void {
    if (this.esUsuarioActual(usuario)) {
      this.snackBar.open('No puedes editar tu propio usuario', 'Cerrar', { duration: 3000 });
      return;
    }

    this.dialog.open(UsuarioFormDialogComponent, {
      width: '600px',
      data: { usuario }
    }).afterClosed().subscribe((result) => {
      if (result) {
        const index = this.usuarios.findIndex(u => u.correo === usuario.correo);
        if (index !== -1 && !this.esRolAdmin(result.rol)) {
          this.usuarios[index] = result;
        } else if (index !== -1 && this.esRolAdmin(result.rol)) {
          this.usuarios = this.usuarios.filter((u) => u.correo !== usuario.correo);
        }
        this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  eliminarUsuario(correo: string): void {
    if ((correo || '').toLowerCase() === this.currentUserCorreo) {
      this.snackBar.open('No puedes eliminar tu propio usuario', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.usuarioService.eliminarPorCorreo(correo).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.correo !== correo);
          this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
          this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  esUsuarioActual(usuario: UsuarioDTO): boolean {
    return (usuario.correo || '').toLowerCase() === this.currentUserCorreo;
  }

  agregarUsuarioALista(usuario: UsuarioDTO): void {
    if (this.esRolAdmin(usuario.rol)) {
      return;
    }

    const existe = this.usuarios.find(u => u.correo === usuario.correo);
    if (!existe) {
      this.usuarios = [...this.usuarios, usuario];
    }
  }

  private esRolAdmin(rol: string): boolean {
    return (rol || '').toUpperCase() === 'ADMIN';
  }

  getRolClass(rol: string): string {
    switch (rol?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-50 text-red-700';
      case 'VENDEDOR':
        return 'bg-blue-50 text-blue-700';
      case 'GERENTE':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }
}

@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSave()">
      <h2 mat-dialog-title>
        {{ data.usuario ? 'Editar Usuario' : 'Nuevo Usuario' }}
      </h2>

      <mat-dialog-content>
        <div class="space-y-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="nombres" />
            <mat-error *ngIf="form.get('nombres')?.hasError('required')">
              Los nombres son requeridos
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="apellidos" />
            <mat-error *ngIf="form.get('apellidos')?.hasError('required')">
              Los apellidos son requeridos
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Correo</mat-label>
            <input matInput type="email" formControlName="correo" />
            <mat-error *ngIf="form.get('correo')?.hasError('required')">
              El correo es requerido
            </mat-error>
            <mat-error *ngIf="form.get('correo')?.hasError('email')">
              Correo inválido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full" *ngIf="!data.usuario">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="contrasena" />
            <mat-error *ngIf="form.get('contrasena')?.hasError('required')">
              La contraseña es requerida
            </mat-error>
            <mat-error *ngIf="form.get('contrasena')?.hasError('minlength')">
              Mínimo 6 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="rol">
              <mat-option value="ADMIN">Administrador</mat-option>
              <mat-option value="VENDEDOR">Vendedor</mat-option>
              <mat-option value="GERENTE">Gerente</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit">
          Guardar
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class UsuarioFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    public dialogRef: MatDialogRef<UsuarioFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: UsuarioDTO | null }
  ) {
    this.form = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', data.usuario ? [] : [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required]
    });

    if (data.usuario) {
      this.form.patchValue(data.usuario);
    }
  }

  onSave(): void {
    if (this.form.invalid) return;

    const usuario: UsuarioDTO = this.form.value;

    if (this.data.usuario?.idUsuario) {
      usuario.idUsuario = this.data.usuario.idUsuario;
      this.usuarioService.actualizarUsuario(usuario).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error actualizando usuario:', error);
        }
      });
    } else {
      this.usuarioService.crearUsuario(usuario).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error creando usuario:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
