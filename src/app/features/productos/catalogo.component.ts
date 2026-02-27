import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { ProductoService } from './services/producto.service';
import { ProductListDTO, FiltroVidrioDTO } from '../../shared/models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Catálogo de Productos</h1>

        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <form [formGroup]="filterForm" (ngSubmit)="onFilter()" class="grid grid-cols-5 gap-4">
            <mat-form-field>
              <mat-label>Marca</mat-label>
              <input matInput formControlName="marcaVehiculo" placeholder="Ej: Toyota" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Modelo</mat-label>
              <input matInput formControlName="modeloVehiculo" placeholder="Ej: Corolla" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Año</mat-label>
              <input matInput formControlName="anioVehiculo" placeholder="Ej: 2024" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Tipo de Vidrio</mat-label>
              <input matInput formControlName="tipoVidrio" placeholder="Ej: Parabrisas" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Calidad</mat-label>
              <input matInput formControlName="calidadVidrio" placeholder="Ej: Templado" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Proveedor</mat-label>
              <input matInput formControlName="nombreProveedor" placeholder="Proveedor" />
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="col-span-1">
              Filtrar
            </button>
            <button mat-stroked-button type="button" (click)="onReset()" class="col-span-1">
              Limpiar
            </button>
          </form>
        </div>

        <!-- Tabla de Productos -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div *ngIf="isLoading" class="flex justify-center p-8">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <table
            mat-table
            [dataSource]="productos"
            *ngIf="!isLoading && productos.length > 0"
            class="w-full"
          >
            <!-- Columna Marca -->
            <ng-container matColumnDef="marca">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Marca
              </th>
              <td mat-cell *matCellDef="let element">{{ element.marcaVehiculo }}</td>
            </ng-container>

            <!-- Columna Modelo -->
            <ng-container matColumnDef="modelo">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Modelo
              </th>
              <td mat-cell *matCellDef="let element">{{ element.modeloVehiculo }}</td>
            </ng-container>

            <!-- Columna Año -->
            <ng-container matColumnDef="anio">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Año
              </th>
              <td mat-cell *matCellDef="let element">{{ element.anioVehiculo }}</td>
            </ng-container>

            <!-- Columna Tipo de Vidrio -->
            <ng-container matColumnDef="tipoVidrio">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Tipo
              </th>
              <td mat-cell *matCellDef="let element">{{ element.tipoVidrio }}</td>
            </ng-container>

            <!-- Columna Calidad -->
            <ng-container matColumnDef="calidad">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Calidad
              </th>
              <td mat-cell *matCellDef="let element">{{ element.calidadVidrio }}</td>
            </ng-container>

            <!-- Columna Precio -->
            <ng-container matColumnDef="precio">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Precio Venta
              </th>
              <td mat-cell *matCellDef="let element">
                {{ element.precioVenta | currency : 'PEN' : 'S/' }}
              </td>
            </ng-container>

            <!-- Columna Stock -->
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Stock
              </th>
              <td
                mat-cell
                *matCellDef="let element"
                [class]="element.stockActual <= 5 ? 'text-red-600 font-semibold' : ''"
              >
                {{ element.stockActual }}
                <mat-icon
                  *ngIf="element.stockActual <= 5"
                  class="text-red-600 text-lg align-middle"
                  matBadge="!"
                  matBadgeColor="warn"
                >
                  warning
                </mat-icon>
              </td>
            </ng-container>

            <!-- Columna Ubicación -->
            <ng-container matColumnDef="ubicacion">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-100 font-semibold">
                Ubicación
              </th>
              <td mat-cell *matCellDef="let element">{{ element.ubicacionAlmacen }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="!isLoading && productos.length === 0" class="p-8 text-center text-gray-500">
            No se encontraron productos
          </div>
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
export class CatalogoComponent implements OnInit {
  productos: ProductListDTO[] = [];
  productosCompletos: ProductListDTO[] = [];
  isLoading = false;
  filterForm: FormGroup;
  displayedColumns: string[] = ['marca', 'modelo', 'anio', 'tipoVidrio', 'calidad', 'precio', 'stock', 'ubicacion'];

  constructor(private productoService: ProductoService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.filterForm = this.fb.group({
      marcaVehiculo: [''],
      modeloVehiculo: [''],
      anioVehiculo: [''],
      tipoVidrio: [''],
      calidadVidrio: [''],
      nombreProveedor: ['']
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.productoService.getCatalogo().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosCompletos = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error cargando productos:', error);
      }
    });
  }

  onFilter(): void {
    const filtroRaw: FiltroVidrioDTO = this.filterForm.value;
    
    // Filtrado en frontend - case-insensitive
    this.productos = this.productosCompletos.filter((producto) => {
      // Si el campo de filtro tiene valor y NO coincide con el producto, rechaza el producto
      if (filtroRaw.marcaVehiculo && 
          !producto.marcaVehiculo.toLowerCase().includes(filtroRaw.marcaVehiculo.toLowerCase())) {
        return false;
      }
      if (filtroRaw.modeloVehiculo && 
          !producto.modeloVehiculo.toLowerCase().includes(filtroRaw.modeloVehiculo.toLowerCase())) {
        return false;
      }
      if (filtroRaw.anioVehiculo && 
          !producto.anioVehiculo.toLowerCase().includes(filtroRaw.anioVehiculo.toLowerCase())) {
        return false;
      }
      if (filtroRaw.tipoVidrio && 
          !producto.tipoVidrio.toLowerCase().includes(filtroRaw.tipoVidrio.toLowerCase())) {
        return false;
      }
      if (filtroRaw.calidadVidrio && 
          !producto.calidadVidrio.toLowerCase().includes(filtroRaw.calidadVidrio.toLowerCase())) {
        return false;
      }
      if (filtroRaw.nombreProveedor && 
          !producto.nombreProveedor.toLowerCase().includes(filtroRaw.nombreProveedor.toLowerCase())) {
        return false;
      }
      // Si pasó todos los filtros, acepta el producto
      return true;
    });
    
    this.cdr.detectChanges();
  }

  onReset(): void {
    this.filterForm.reset();
    this.cargarProductos();
  }
}
