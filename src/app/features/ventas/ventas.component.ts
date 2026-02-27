import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoService } from '../productos/services/producto.service';
import { VentaService } from './services/venta.service';
import { ProductListDTO, VentaDTO, DetalleVentaListDTO } from '../../shared/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Punto de Venta (POS)</h1>

      <div class="grid grid-cols-3 gap-6">
        <!-- Panel de búsqueda y productos -->
        <div class="col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Buscar Productos</h2>

            <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="grid grid-cols-3 gap-4 mb-6">
              <mat-form-field>
                <mat-label>Placa del Vehículo</mat-label>
                <input matInput formControlName="placa" placeholder="Ej: ABC-1234" />
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit">
                Buscar por Placa
              </button>

              <div></div>

              <mat-form-field class="col-span-2">
                <mat-label>O por Producto ID</mat-label>
                <input matInput formControlName="productoId" type="number" placeholder="ID del producto" />
              </mat-form-field>
            </form>

            <div *ngIf="isSearching" class="flex justify-center mb-6">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <!-- Productos disponibles -->
            <div class="max-h-64 overflow-y-auto">
              <table mat-table [dataSource]="productosDisponibles" class="w-full">
                <ng-container matColumnDef="marca">
                  <th mat-header-cell *matHeaderCellDef>Marca</th>
                  <td mat-cell *matCellDef="let element">{{ element.marcaVehiculo }}</td>
                </ng-container>

                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let element">{{ element.tipoVidrio }}</td>
                </ng-container>

                <ng-container matColumnDef="precio">
                  <th mat-header-cell *matHeaderCellDef>Precio</th>
                  <td mat-cell *matCellDef="let element">
                    {{ element.precioVenta | currency : 'PEN' : 'S/' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acción</th>
                  <td mat-cell *matCellDef="let element">
                    <button
                      mat-icon-button
                      color="accent"
                      (click)="agregarAlCarrito(element)"
                      [disabled]="element.stockActual <= 0"
                    >
                      <mat-icon>add_shopping_cart</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="productosColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: productosColumns;"></tr>
              </table>

              <div *ngIf="productosDisponibles.length === 0" class="p-4 text-center text-gray-500">
                No hay productos disponibles
              </div>
            </div>
          </div>
        </div>

        <!-- Carrito y resumen -->
        <div class="col-span-1">
          <mat-card class="sticky top-6">
            <mat-card-header>
              <mat-card-title>Carrito de Compras</mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="carritoForm">
                <div class="mb-4">
                  <mat-form-field class="w-full">
                    <mat-label>Placa Vehículo</mat-label>
                    <input
                      matInput
                      formControlName="placaVehiculo"
                      placeholder="ABC-1234"
                      required
                    />
                  </mat-form-field>
                </div>
              </form>

              <!-- Items del carrito -->
              <div class="max-h-80 overflow-y-auto mb-6 border-t border-b py-4">
                <div *ngFor="let item of carritoItems; let i = index" class="mb-4 p-3 bg-gray-50 rounded">
                  <div class="flex justify-between mb-2">
                    <span class="font-semibold">{{ item.productoNombre }}</span>
                    <button mat-icon-button color="warn" (click)="eliminarDelCarrito(i)" size="small">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>

                  <div class="text-sm text-gray-600 mb-2">
                    Precio: {{ item.precioUnitario | currency : 'PEN' : 'S/' }}
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      mat-icon-button
                      (click)="decrementarCantidad(i)"
                      [disabled]="item.cantidad <= 1"
                      size="small"
                    >
                      <mat-icon>remove</mat-icon>
                    </button>
                    <input
                      type="number"
                      [value]="item.cantidad"
                      (input)="updateCantidad(i, $event)"
                      class="w-12 text-center border rounded"
                      min="1"
                    />
                    <button
                      mat-icon-button
                      (click)="incrementarCantidad(i)"
                      size="small"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>

                  <div class="text-right mt-2 font-semibold">
                    Subtotal: {{ item.subtotal | currency : 'PEN' : 'S/' }}
                  </div>
                </div>

                <div *ngIf="carritoItems.length === 0" class="text-center text-gray-500 py-6">
                  Carrito vacío
                </div>
              </div>

              <!-- Resumen total -->
              <div class="border-t pt-4">
                <div class="text-right mb-4">
                  <div class="text-2xl font-bold text-blue-600">
                    Total: {{ totalVenta | currency : 'PEN' : 'S/' }}
                  </div>
                </div>

                <button
                  mat-raised-button
                  color="primary"
                  (click)="confirmarVenta()"
                  [disabled]="carritoItems.length === 0 || !carritoForm.valid"
                  class="w-full py-3 text-lg font-semibold"
                >
                  Confirmar Venta
                </button>
              </div>
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
export class VentasComponent implements OnInit {
  searchForm: FormGroup;
  carritoForm: FormGroup;
  productosDisponibles: ProductListDTO[] = [];
  carritoItems: any[] = [];
  totalVenta = 0;
  isSearching = false;
  productosColumns = ['marca', 'tipo', 'precio', 'acciones'];

  constructor(
    private productoService: ProductoService,
    private ventaService: VentaService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      placa: [''],
      productoId: ['']
    });
    this.carritoForm = this.fb.group({
      placaVehiculo: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  onSearch(): void {
    const placa = this.searchForm.value.placa;
    const productoId = this.searchForm.value.productoId;

    if (placa) {
      this.isSearching = true;
      this.cdr.detectChanges();
      this.productoService.buscarPorPlaca(placa).subscribe({
        next: (data) => {
          this.productosDisponibles = data;
          this.isSearching = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSearching = false;
          this.cdr.detectChanges();
          console.error('Error buscando productos:', error);
        }
      });
    } else if (productoId) {
      this.isSearching = true;
      this.cdr.detectChanges();
      this.productoService.getProductoById(productoId).subscribe({
        next: (data) => {
          this.productosDisponibles = [data];
          this.isSearching = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isSearching = false;
          this.cdr.detectChanges();
          console.error('Error buscando producto:', error);
        }
      });
    }
  }

  agregarAlCarrito(producto: ProductListDTO): void {
    const itemExistente = this.carritoItems.find((item) => item.idProducto === producto.idProducto);

    if (itemExistente) {
      itemExistente.cantidad++;
      this.calcularSubtotal(this.carritoItems.indexOf(itemExistente));
    } else {
      this.carritoItems.push({
        idProducto: producto.idProducto,
        productoNombre: `${producto.marcaVehiculo} - ${producto.tipoVidrio}`,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta
      });
    }

    this.actualizarTotal();
  }

  eliminarDelCarrito(index: number): void {
    this.carritoItems.splice(index, 1);
    this.actualizarTotal();
  }

  incrementarCantidad(index: number): void {
    this.carritoItems[index].cantidad++;
    this.calcularSubtotal(index);
  }

  decrementarCantidad(index: number): void {
    if (this.carritoItems[index].cantidad > 1) {
      this.carritoItems[index].cantidad--;
      this.calcularSubtotal(index);
    }
  }

  updateCantidad(index: number, event: any): void {
    const nuevaCantidad = parseInt(event.target.value, 10);
    if (nuevaCantidad > 0) {
      this.carritoItems[index].cantidad = nuevaCantidad;
      this.calcularSubtotal(index);
    }
  }

  calcularSubtotal(index: number): void {
    const item = this.carritoItems[index];
    item.subtotal = item.cantidad * item.precioUnitario;
    this.actualizarTotal();
  }

  actualizarTotal(): void {
    this.totalVenta = this.carritoItems.reduce((total, item) => total + item.subtotal, 0);
  }

  confirmarVenta(): void {
    if (this.carritoItems.length === 0 || !this.carritoForm.valid) return;

    const usuario = this.authService.getCurrentUser();
    
    const detalles: DetalleVentaListDTO[] = this.carritoItems.map((item) => ({
      idProducto: item.idProducto,
      cantidad: item.cantidad,
      precioVenta: item.precioUnitario
    }));

    const venta: VentaDTO = {
      idUsuario: usuario?.idUsuario || 0,
      placaVehiculo: this.carritoForm.value.placaVehiculo,
      totalVenta: this.totalVenta,
      detalles: detalles
    };

    this.ventaService.crearVenta(venta).subscribe({
      next: (response) => {
        this.snackBar.open('¡Venta realizada exitosamente!', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.carritoItems = [];
        this.totalVenta = 0;
        this.carritoForm.reset();
        this.searchForm.reset();
        this.productosDisponibles = [];
      },
      error: (error) => {
        console.error('Error creando venta:', error);
        this.snackBar.open('Error al crear la venta. Por favor, intente de nuevo.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
