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
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Usuario
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div *ngIf="isLoading" class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!isLoading && usuarios.length > 0" class="overflow-x-auto">
          <table mat-table [dataSource]="usuarios">
            <ng-container matColumnDef="nombres">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Nombre
              </th>
              <td mat-cell *matCellDef="let element">{{ element.nombres }} {{ element.apellidos }}</td>
            </ng-container>

            <ng-container matColumnDef="correo">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Correo
              </th>
              <td mat-cell *matCellDef="let element">{{ element.correo }}</td>
            </ng-container>

            <ng-container matColumnDef="rol">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Rol
              </th>
              <td mat-cell *matCellDef="let element">
                <span class="px-3 py-1 rounded-full text-sm font-medium" [ngClass]="getRolClass(element.rol)">
                  {{ element.rol }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Acciones
              </th>
              <td mat-cell *matCellDef="let element">
                <button
                  mat-icon-button
                  color="primary"
                  (click)="editarUsuario(element)"
                  matTooltip="Editar"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="eliminarUsuario(element.correo)"
                  matTooltip="Eliminar"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div *ngIf="!isLoading && usuarios.length === 0" class="p-8 text-center text-gray-500">
          No hay usuarios registrados. Usa el botón "Nuevo Usuario" para crear uno.
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
        padding: 1rem;
        text-align: left;
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      tr:hover td {
        background-color: #f9fafb;
      }
    `
  ]
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  isLoading = false;
  displayedColumns: string[] = ['nombres', 'correo', 'rol', 'acciones'];

  constructor(
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios = data;
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
    this.dialog.open(UsuarioFormDialogComponent, {
      width: '600px',
      data: { usuario }
    }).afterClosed().subscribe((result) => {
      if (result) {
        const index = this.usuarios.findIndex(u => u.correo === usuario.correo);
        if (index !== -1) {
          this.usuarios[index] = result;
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

  agregarUsuarioALista(usuario: UsuarioDTO): void {
    const existe = this.usuarios.find(u => u.correo === usuario.correo);
    if (!existe) {
      this.usuarios = [...this.usuarios, usuario];
    }
  }

  getRolClass(rol: string): string {
    switch (rol?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'VENDEDOR':
        return 'bg-blue-100 text-blue-800';
      case 'GERENTE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <h2 mat-dialog-title>
      {{ data.usuario ? 'Editar Usuario' : 'Nuevo Usuario' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="space-y-4">
        <mat-form-field class="w-full">
          <mat-label>Nombres</mat-label>
          <input matInput formControlName="nombres" required />
          <mat-error *ngIf="form.get('nombres')?.hasError('required')">
            Los nombres son requeridos
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Apellidos</mat-label>
          <input matInput formControlName="apellidos" required />
          <mat-error *ngIf="form.get('apellidos')?.hasError('required')">
            Los apellidos son requeridos
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Correo</mat-label>
          <input matInput type="email" formControlName="correo" required />
          <mat-error *ngIf="form.get('correo')?.hasError('required')">
            El correo es requerido
          </mat-error>
          <mat-error *ngIf="form.get('correo')?.hasError('email')">
            Correo inválido
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full" *ngIf="!data.usuario">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" formControlName="contrasena" required />
          <mat-error *ngIf="form.get('contrasena')?.hasError('required')">
            La contraseña es requerida
          </mat-error>
          <mat-error *ngIf="form.get('contrasena')?.hasError('minlength')">
            Mínimo 6 caracteres
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rol" required>
            <mat-option value="ADMIN">Administrador</mat-option>
            <mat-option value="VENDEDOR">Vendedor</mat-option>
            <mat-option value="GERENTE">Gerente</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!form.valid">
        Guardar
      </button>
    </mat-dialog-actions>
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
