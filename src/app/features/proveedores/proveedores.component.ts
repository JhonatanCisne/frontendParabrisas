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
import { ProveedorService } from './services/proveedor.service';
import { ProveedorDTO } from '../../shared/models';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Proveedores</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Proveedor
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div *ngIf="isLoading" class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <table mat-table [dataSource]="proveedores" *ngIf="!isLoading && proveedores.length > 0">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Nombre del Proveedor
            </th>
            <td mat-cell *matCellDef="let element">{{ element.nombreProveedor }}</td>
          </ng-container>

          <ng-container matColumnDef="telefono">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Teléfono
            </th>
            <td mat-cell *matCellDef="let element">{{ element.telefono }}</td>
          </ng-container>

          <ng-container matColumnDef="direccion">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Dirección
            </th>
            <td mat-cell *matCellDef="let element">{{ element.direccion }}</td>
          </ng-container>

          <ng-container matColumnDef="estadoCredito">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Estado de Crédito
            </th>
            <td mat-cell *matCellDef="let element">
              <span class="px-3 py-1 rounded-full text-sm font-medium" [ngClass]="getEstadoClass(element.estadoCredito)">
                {{ element.estadoCredito || 'Sin Definir' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="montoCredito">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Monto de Crédito
            </th>
            <td mat-cell *matCellDef="let element">
              {{ element.montoCredito ? (element.montoCredito | currency : 'PEN' : 'S/') : 'Sin Definir' }}
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
                (click)="editarProveedor(element)"
                matTooltip="Editar"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="accent"
                (click)="editarCredito(element)"
                matTooltip="Editar Crédito"
              >
                <mat-icon>credit_card</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="eliminarProveedor(element.idProveedor!)"
                matTooltip="Eliminar"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="!isLoading && proveedores.length === 0" class="p-8 text-center text-gray-500">
          No hay proveedores registrados
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
export class ProveedoresComponent implements OnInit {
  proveedores: ProveedorDTO[] = [];
  isLoading = false;
  displayedColumns: string[] = ['nombre', 'telefono', 'direccion', 'estadoCredito', 'montoCredito', 'acciones'];

  constructor(
    private proveedorService: ProveedorService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.proveedorService.listarProveedores().subscribe({
      next: (data: ProveedorDTO[]) => {
        this.proveedores = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error cargando proveedores:', error);
        this.snackBar.open('Error al cargar proveedores', 'Cerrar', { duration: 5000 });
      }
    });
  }

  openDialog(): void {
    this.dialog.open(ProveedorFormDialogComponent, {
      width: '600px',
      data: { proveedor: null }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Proveedor creado correctamente: ' + result.nombreProveedor, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.cargarProveedores();
      }
    });
  }

  editarProveedor(proveedor: ProveedorDTO): void {
    this.dialog.open(ProveedorFormDialogComponent, {
      width: '600px',
      data: { proveedor }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Proveedor actualizado correctamente', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.cargarProveedores();
      }
    });
  }

  eliminarProveedor(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      this.proveedorService.eliminarProveedor(id).subscribe({
        next: () => {
          this.snackBar.open('Proveedor eliminado correctamente', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.cargarProveedores();
        },
        error: (error) => {
          console.error('Error eliminando proveedor:', error);
          this.snackBar.open('Error al eliminar proveedor', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  editarCredito(proveedor: ProveedorDTO): void {
    this.dialog.open(ProveedorCreditoDialogComponent, {
      width: '500px',
      data: { proveedor }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Crédito del proveedor actualizado correctamente', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.cargarProveedores();
      }
    });
  }

  getEstadoClass(estado: string | null | undefined): string {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800';
      case 'INACTIVO':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDIDO':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

@Component({
  selector: 'app-proveedor-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="space-y-4">
        <mat-form-field class="w-full">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombreProveedor" required />
          <mat-error *ngIf="form.get('nombreProveedor')?.hasError('required')">
            El nombre es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" required />
          <mat-error *ngIf="form.get('telefono')?.hasError('required')">
            El teléfono es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" required />
          <mat-error *ngIf="form.get('direccion')?.hasError('required')">
            La dirección es requerida
          </mat-error>
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
export class ProveedorFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    public dialogRef: MatDialogRef<ProveedorFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proveedor: ProveedorDTO | null }
  ) {
    this.form = this.fb.group({
      nombreProveedor: ['', Validators.required],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required]
    });

    if (data.proveedor) {
      this.form.patchValue(data.proveedor);
    }
  }

  onSave(): void {
    if (this.form.invalid) return;

    const proveedor: ProveedorDTO = this.form.value;

    if (this.data.proveedor?.idProveedor) {
      proveedor.idProveedor = this.data.proveedor.idProveedor;
      this.proveedorService.actualizarProveedor(proveedor).subscribe({
        next: (result: ProveedorDTO) => {
          this.dialogRef.close(result);
        },
        error: (error: any) => {
          console.error('Error actualizando proveedor:', error);
        }
      });
    } else {
      this.proveedorService.crearProveedor(proveedor).subscribe({
        next: (result: ProveedorDTO) => {
          this.dialogRef.close(result);
        },
        error: (error: any) => {
          console.error('Error creando proveedor:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-proveedor-credito-dialog',
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
      Editar Crédito de {{ data.proveedor.nombreProveedor }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="space-y-4">
        <mat-form-field class="w-full">
          <mat-label>Estado de Crédito</mat-label>
          <mat-select formControlName="estadoCredito" required>
            <mat-option value="Activo">Activo</mat-option>
            <mat-option value="Inactivo">Inactivo</mat-option>
            <mat-option value="Suspendido">Suspendido</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Monto de Crédito (S/)</mat-label>
          <input matInput type="number" formControlName="montoCredito" min="0" step="0.01" />
          <mat-error *ngIf="form.get('montoCredito')?.hasError('min')">
            El monto debe ser mayor o igual a 0
          </mat-error>
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
export class ProveedorCreditoDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    public dialogRef: MatDialogRef<ProveedorCreditoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proveedor: ProveedorDTO }
  ) {
    this.form = this.fb.group({
      estadoCredito: [data.proveedor.estadoCredito || '', Validators.required],
      montoCredito: [data.proveedor.montoCredito || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSave(): void {
    if (this.form.invalid) return;

    const estadoCredito = this.form.get('estadoCredito')?.value;
    const montoCredito = this.form.get('montoCredito')?.value;

    // Actualizar monto de crédito
    this.proveedorService
      .actualizarMonto(this.data.proveedor.nombreProveedor, montoCredito)
      .subscribe({
        next: () => {
          // Actualizar estado de crédito mediante PUT
          const proveedorActualizado: ProveedorDTO = {
            ...this.data.proveedor,
            estadoCredito: estadoCredito,
            montoCredito: montoCredito
          };
          
          this.proveedorService.actualizarProveedor(proveedorActualizado).subscribe({
            next: (result) => {
              this.dialogRef.close(result);
            },
            error: (error) => {
              console.error('Error actualizando proveedor:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error actualizando monto:', error);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
