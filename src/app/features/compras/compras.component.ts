import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CompraService } from './services/compra.service';
import { ProveedorService } from '../proveedores/services/proveedor.service';
import { CompraDTO, DetalleListCompraDTO, ProveedorDTO } from '../../shared/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Ingreso de Inventario (Compras)</h1>

      <div class="grid grid-cols-3 gap-6">
        <!-- Panel de ingreso de detalles -->
        <div class="col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Agregar Detalle de Compra</h2>

            <form [formGroup]="detalleForm" (ngSubmit)="agregarDetalle()" class="grid grid-cols-4 gap-4">
              <mat-form-field>
                <mat-label>ID Producto</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="idProducto"
                  placeholder="123"
                  required
                />
              </mat-form-field>

              <mat-form-field>
                <mat-label>Cantidad</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="cantidad"
                  placeholder="10"
                  required
                />
              </mat-form-field>

              <mat-form-field>
                <mat-label>Costo Unitario</mat-label>
                <input
                  matInput
                  type="number"
                  step="0.01"
                  formControlName="costoUnitario"
                  placeholder="0.00"
                  required
                />
              </mat-form-field>

              <button mat-raised-button color="accent" type="submit" [disabled]="!detalleForm.valid">
                Agregar
              </button>
            </form>
          </div>

          <!-- Tabla de detalles -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Detalles de Compra</h3>

            <div class="max-h-96 overflow-y-auto">
              <table mat-table [dataSource]="detalleCompras" class="w-full">
                <ng-container matColumnDef="idProducto">
                  <th mat-header-cell *matHeaderCellDef>ID Producto</th>
                  <td mat-cell *matCellDef="let element">{{ element.idProducto }}</td>
                </ng-container>

                <ng-container matColumnDef="cantidad">
                  <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                  <td mat-cell *matCellDef="let element">{{ element.cantidad }}</td>
                </ng-container>

                <ng-container matColumnDef="costo">
                  <th mat-header-cell *matHeaderCellDef>Costo Unitario</th>
                  <td mat-cell *matCellDef="let element">
                    {{ element.costoCompra | currency : 'PEN' : 'S/' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="subtotal">
                  <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                  <td mat-cell *matCellDef="let element">
                    {{ (element.costoCompra * element.cantidad) | currency : 'PEN' : 'S/' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acción</th>
                  <td mat-cell *matCellDef="let element; let i = index">
                    <button mat-icon-button color="warn" (click)="eliminarDetalle(i)" size="small">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="detalleColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: detalleColumns;"></tr>
              </table>

              <div *ngIf="detalleCompras.length === 0" class="p-8 text-center text-gray-500">
                No hay detalles agregados aún
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de resumen y confirmación -->
        <div class="col-span-1">
          <mat-card class="sticky top-6">
            <mat-card-header>
              <mat-card-title>Resumen de Compra</mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="compraForm">
                <mat-form-field class="w-full mb-4">
                  <mat-label>Proveedor</mat-label>
                  <mat-select formControlName="nombreProveedor" required>
                    <mat-option value="">Seleccionar proveedor</mat-option>
                    <mat-option *ngFor="let prov of proveedores" [value]="prov.nombreProveedor">
                      {{ prov.nombreProveedor }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </form>

              <div *ngIf="isLoadingProveedores" class="flex justify-center mb-4">
                <mat-spinner diameter="30"></mat-spinner>
              </div>

              <!-- Resumen -->
              <div class="border-t border-b py-4 my-4">
                <div class="flex justify-between mb-2">
                  <span>Cantidad de items:</span>
                  <strong>{{ detalleCompras.length }}</strong>
                </div>

                <div class="flex justify-between mb-2">
                  <span>Total Unidades:</span>
                  <strong>{{ totalUnidades }}</strong>
                </div>

                <div class="text-right my-4">
                  <div class="text-2xl font-bold text-blue-600">
                    Total: {{ totalCompra | currency : 'PEN' : 'S/' }}
                  </div>
                </div>
              </div>

              <button
                mat-raised-button
                color="primary"
                (click)="confirmarCompra()"
                [disabled]="detalleCompras.length === 0 || !compraForm.valid || isLoading"
                class="w-full py-3 text-lg font-semibold"
              >
                <span *ngIf="!isLoading">Confirmar Compra</span>
                <mat-spinner *ngIf="isLoading" diameter="24" class="inline-block"></mat-spinner>
              </button>
            </mat-card-content>
          </mat-card>
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
        padding: 0.75rem;
        text-align: left;
        background-color: #f3f4f6;
        font-weight: 600;
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
      }
    `
  ]
})
export class ComprasComponent implements OnInit {
  detalleForm: FormGroup;
  compraForm: FormGroup;
  detalleCompras: DetalleListCompraDTO[] = [];
  proveedores: ProveedorDTO[] = [];
  totalCompra = 0;
  totalUnidades = 0;
  isLoading = false;
  isLoadingProveedores = false;
  detalleColumns = ['idProducto', 'cantidad', 'costo', 'subtotal', 'acciones'];

  constructor(
    private compraService: CompraService,
    private proveedorService: ProveedorService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.detalleForm = this.fb.group({
      idProducto: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      costoUnitario: ['', [Validators.required, Validators.min(0)]]
    });

    this.compraForm = this.fb.group({
      nombreProveedor: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.isLoadingProveedores = true;
    this.cdr.detectChanges();
    this.proveedorService.listarProveedores().subscribe({
      next: (data: ProveedorDTO[]) => {
        this.proveedores = data;
        this.isLoadingProveedores = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoadingProveedores = false;
        this.cdr.detectChanges();
        console.error('Error cargando proveedores:', error);
      }
    });
  }

  agregarDetalle(): void {
    if (this.detalleForm.invalid) return;

    const detalle: DetalleListCompraDTO = {
      idProducto: this.detalleForm.value.idProducto,
      cantidad: this.detalleForm.value.cantidad,
      costoCompra: this.detalleForm.value.costoUnitario
    };

    this.detalleCompras.push(detalle);
    this.actualizarTotales();
    this.detalleForm.reset();
  }

  eliminarDetalle(index: number): void {
    this.detalleCompras.splice(index, 1);
    this.actualizarTotales();
  }

  actualizarTotales(): void {
    this.totalCompra = this.detalleCompras.reduce((total, item) => total + (item.costoCompra * item.cantidad), 0);
    this.totalUnidades = this.detalleCompras.reduce((total, item) => total + item.cantidad, 0);
  }

  confirmarCompra(): void {
    if (this.detalleCompras.length === 0 || !this.compraForm.valid) return;

    this.isLoading = true;
    const usuario = this.authService.getCurrentUser();
    
    const compra: CompraDTO = {
      nombreProveedor: this.compraForm.value.nombreProveedor,
      idUsuario: usuario?.idUsuario || 0,
      totalCompra: this.totalCompra,
      detalle: this.detalleCompras
    };

    this.compraService.crearCompra(compra).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('¡Compra registrada exitosamente!', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.detalleCompras = [];
        this.totalCompra = 0;
        this.totalUnidades = 0;
        this.compraForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando compra:', error);
        this.snackBar.open('Error al crear la compra. Por favor, intente de nuevo.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
