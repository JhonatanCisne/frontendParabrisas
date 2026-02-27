import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule
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

          <ng-container matColumnDef="contacto">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Contacto
            </th>
            <td mat-cell *matCellDef="let element">{{ element.contacto }}</td>
          </ng-container>

          <ng-container matColumnDef="telefono">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Teléfono
            </th>
            <td mat-cell *matCellDef="let element">{{ element.telefono }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Email
            </th>
            <td mat-cell *matCellDef="let element">{{ element.email }}</td>
          </ng-container>

          <ng-container matColumnDef="ciudad">
            <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
              Ciudad
            </th>
            <td mat-cell *matCellDef="let element">{{ element.ciudad }}</td>
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
  displayedColumns: string[] = ['nombre', 'contacto', 'telefono', 'email', 'ciudad', 'acciones'];

  constructor(private proveedorService: ProveedorService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

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
      }
    });
  }

  openDialog(): void {
    this.dialog.open(ProveedorFormDialogComponent, {
      width: '600px',
      data: { proveedor: null }
    }).afterClosed().subscribe((result) => {
      if (result) {
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
        this.cargarProveedores();
      }
    });
  }

  eliminarProveedor(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      this.proveedorService.eliminarProveedor(id).subscribe({
        next: () => {
          this.cargarProveedores();
        },
        error: (error) => {
          console.error('Error eliminando proveedor:', error);
        }
      });
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
          <mat-label>Contacto</mat-label>
          <input matInput formControlName="contacto" required />
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" required />
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required />
          <mat-error *ngIf="form.get('email')?.hasError('email')">
            Email inválido
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" required />
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Ciudad</mat-label>
          <input matInput formControlName="ciudad" required />
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
      contacto: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required]
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
