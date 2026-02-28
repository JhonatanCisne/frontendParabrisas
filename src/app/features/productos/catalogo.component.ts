import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoService } from './services/producto.service';
import { ProductListDTO, FiltroVidrioDTO } from '../../shared/models';
import { Inject } from '@angular/core';

interface ProductoAgrupado {
  key: string;
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  tipoVidrio: string;
  calidadVidrio: string;
  nombreProveedor: string;
  stockTotal: number;
  stockBajoAlertaGeneral: boolean;
  stockBajoAlertaIndeterminado: boolean;
  productos: ProductListDTO[];
}

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
    MatBadgeModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div>
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="page-icon">
            <mat-icon>inventory</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900" style="letter-spacing: -0.02em">Catálogo de Productos</h1>
            <p class="text-sm text-slate-500 mt-0.5">Consulta y gestiona el inventario de vidrios</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <form [formGroup]="filterForm" (ngSubmit)="onFilter()" class="grid grid-cols-5 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Marca</mat-label>
              <input matInput formControlName="marcaVehiculo" placeholder="Ej: Toyota" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Modelo</mat-label>
              <input matInput formControlName="modeloVehiculo" placeholder="Ej: Corolla" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Año Desde</mat-label>
              <input matInput formControlName="anioDesde" placeholder="Ej: 2020" type="number" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Año Hasta</mat-label>
              <input matInput formControlName="anioHasta" placeholder="Ej: 2024" type="number" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Vidrio</mat-label>
              <input matInput formControlName="tipoVidrio" placeholder="Ej: Parabrisas" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Calidad</mat-label>
              <input matInput formControlName="calidadVidrio" placeholder="Ej: Templado" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Proveedor</mat-label>
              <input matInput formControlName="nombreProveedor" placeholder="Proveedor" />
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="col-span-1 h-14 self-start mt-1">
              <mat-icon class="mr-1">search</mat-icon>
              Filtrar
            </button>
            <button mat-stroked-button type="button" (click)="onReset()" class="col-span-1 h-14 self-start mt-1">
              Limpiar
            </button>
          </form>
        </div>

        <!-- Tabla de Productos -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div *ngIf="isLoading" class="flex justify-center p-12">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <table
            mat-table
            [dataSource]="productosAgrupados"
            *ngIf="!isLoading && productosAgrupados.length > 0"
            class="w-full"
          >
            <ng-container matColumnDef="marca">
              <th mat-header-cell *matHeaderCellDef>Marca</th>
              <td mat-cell *matCellDef="let element" class="font-medium">{{ element.marcaVehiculo }}</td>
            </ng-container>

            <ng-container matColumnDef="modelo">
              <th mat-header-cell *matHeaderCellDef>Modelo</th>
              <td mat-cell *matCellDef="let element">{{ element.modeloVehiculo }}</td>
            </ng-container>

            <ng-container matColumnDef="anio">
              <th mat-header-cell *matHeaderCellDef>Año</th>
              <td mat-cell *matCellDef="let element">{{ element.anioVehiculo }}</td>
            </ng-container>

            <ng-container matColumnDef="tipoVidrio">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let element">{{ element.tipoVidrio }}</td>
            </ng-container>

            <ng-container matColumnDef="calidad">
              <th mat-header-cell *matHeaderCellDef>Calidad</th>
              <td mat-cell *matCellDef="let element">{{ element.calidadVidrio }}</td>
            </ng-container>

            <ng-container matColumnDef="precio">
              <th mat-header-cell *matHeaderCellDef>Precio Venta</th>
              <td mat-cell *matCellDef="let element" class="font-semibold">
                {{ element.precioVenta | currency : 'PEN' : 'S/' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock Total</th>
              <td mat-cell *matCellDef="let element">
                <span
                  [class]="
                    element.stockBajoAlertaGeneral && element.stockTotal <= 1
                      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200'
                      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700'
                  "
                >
                  {{ element.stockTotal }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="importadora">
              <th mat-header-cell *matHeaderCellDef>Importadora</th>
              <td mat-cell *matCellDef="let element">{{ element.nombreProveedor }}</td>
            </ng-container>

            <ng-container matColumnDef="stockBajoAlerta">
              <th mat-header-cell *matHeaderCellDef class="text-center">Bajo Stock</th>
              <td mat-cell *matCellDef="let element" class="text-center" (click)="$event.stopPropagation()">
                <mat-checkbox
                  [checked]="element.stockBajoAlertaGeneral"
                  [indeterminate]="element.stockBajoAlertaIndeterminado"
                  (change)="toggleAlertaGrupo(element, !element.stockBajoAlertaGeneral)"
                  color="warn"
                ></mat-checkbox>
              </td>
            </ng-container>

            <ng-container matColumnDef="detalle">
              <th mat-header-cell *matHeaderCellDef class="text-center">Detalle</th>
              <td mat-cell *matCellDef="let element" class="text-center">
                <button mat-stroked-button color="primary" (click)="abrirDetalleGrupo(element); $event.stopPropagation()" class="text-xs">
                  Ver detalle
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="abrirDetalleGrupo(row)" class="cursor-pointer"></tr>
          </table>

          <div *ngIf="!isLoading && productosAgrupados.length === 0" class="p-12 text-center text-slate-400">
            <mat-icon class="text-5xl mb-3" style="font-size: 48px; width: 48px; height: 48px; opacity: 0.4">inventory_2</mat-icon>
            <p class="text-base">No se encontraron productos</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .page-icon mat-icon {
        color: white;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      table {
        width: 100%;
      }

      th {
        padding: 14px 16px;
        text-align: left;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #475569;
        font-weight: 600;
        background: #f8fafc;
        border-bottom: 2px solid #e2e8f0;
      }

      td {
        padding: 14px 16px;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        font-size: 0.9rem;
      }

      tr:hover td {
        background-color: #f8fafc;
      }

      tr {
        transition: background-color 0.15s ease;
      }
    `
  ]
})
export class CatalogoComponent implements OnInit {
  productos: ProductListDTO[] = [];
  productosCompletos: ProductListDTO[] = [];
  productosFiltrados: ProductListDTO[] = [];
  productosAgrupados: ProductoAgrupado[] = [];
  isLoading = false;
  filterForm: FormGroup;
  displayedColumns: string[] = ['marca', 'modelo', 'anio', 'tipoVidrio', 'calidad', 'importadora', 'stock', 'stockBajoAlerta', 'detalle'];

  constructor(
    private productoService: ProductoService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      marcaVehiculo: [''],
      modeloVehiculo: [''],
      anioDesde: [null],
      anioHasta: [null],
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
        this.productosFiltrados = data;
        this.productosAgrupados = this.agruparProductos(data);
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
    this.productosFiltrados = this.productosCompletos.filter((producto) => {
      // Si el campo de filtro tiene valor y NO coincide con el producto, rechaza el producto
      if (filtroRaw.marcaVehiculo && 
          !producto.marcaVehiculo.toLowerCase().includes(filtroRaw.marcaVehiculo.toLowerCase())) {
        return false;
      }
      if (filtroRaw.modeloVehiculo && 
          !producto.modeloVehiculo.toLowerCase().includes(filtroRaw.modeloVehiculo.toLowerCase())) {
        return false;
      }
      if (filtroRaw.anioDesde || filtroRaw.anioHasta) {
        const anioProducto = parseInt(producto.anioVehiculo);
        const anioDesde = filtroRaw.anioDesde ? parseInt(filtroRaw.anioDesde) : 0;
        const anioHasta = filtroRaw.anioHasta ? parseInt(filtroRaw.anioHasta) : 9999;
        if (anioProducto < anioDesde || anioProducto > anioHasta) {
          return false;
        }
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

    this.productosAgrupados = this.agruparProductos(this.productosFiltrados);
    
    this.cdr.detectChanges();
  }

  onReset(): void {
    this.filterForm.reset();
    this.cargarProductos();
  }

  toggleAlertaGrupo(grupo: ProductoAgrupado, checked: boolean): void {
    const estadoPrevio = grupo.productos.map((producto) => ({
      idProducto: producto.idProducto,
      stockBajoAlerta: !!producto.stockBajoAlerta
    }));

    grupo.productos.forEach((producto) => {
      producto.stockBajoAlerta = checked;
    });
    this.productosAgrupados = this.agruparProductos(this.productosFiltrados);
    this.cdr.detectChanges();

    const requests = grupo.productos.map((producto) =>
      this.productoService.toggleStockBajoAlerta(producto.idProducto, checked)
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.snackBar.open(
          checked ? 'Grupo marcado como bajo stock' : 'Alerta de bajo stock removida para todo el grupo',
          'Cerrar',
          { duration: 2000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['success-snackbar'] }
        );
      },
      error: (err) => {
        console.error('Error al actualizar alerta grupal:', err);
        grupo.productos.forEach((producto) => {
          const previo = estadoPrevio.find((p) => p.idProducto === producto.idProducto);
          producto.stockBajoAlerta = previo ? previo.stockBajoAlerta : !checked;
        });
        this.productosAgrupados = this.agruparProductos(this.productosFiltrados);
        this.cdr.detectChanges();
        this.snackBar.open('Error al actualizar la alerta', 'Cerrar', {
          duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['error-snackbar']
        });
      }
    });
  }

  abrirDetalleGrupo(grupo: ProductoAgrupado): void {
    this.dialog.open(CatalogoDetalleDialogComponent, {
      width: '920px',
      data: grupo
    });
  }

  private agruparProductos(productos: ProductListDTO[]): ProductoAgrupado[] {
    const map = new Map<string, ProductoAgrupado>();

    for (const producto of productos) {
      const key = [
        producto.marcaVehiculo,
        producto.modeloVehiculo,
        producto.anioVehiculo,
        producto.tipoVidrio,
        producto.calidadVidrio,
        producto.nombreProveedor
      ].join('|');

      const existente = map.get(key);

      if (!existente) {
        map.set(key, {
          key,
          marcaVehiculo: producto.marcaVehiculo,
          modeloVehiculo: producto.modeloVehiculo,
          anioVehiculo: producto.anioVehiculo,
          tipoVidrio: producto.tipoVidrio,
          calidadVidrio: producto.calidadVidrio,
          nombreProveedor: producto.nombreProveedor,
          stockTotal: producto.stockActual,
          stockBajoAlertaGeneral: !!producto.stockBajoAlerta,
          stockBajoAlertaIndeterminado: false,
          productos: [producto]
        });
      } else {
        existente.productos.push(producto);
        existente.stockTotal += producto.stockActual;
        const todosTrue = existente.productos.every((p) => !!p.stockBajoAlerta);
        const todosFalse = existente.productos.every((p) => !p.stockBajoAlerta);
        existente.stockBajoAlertaGeneral = todosTrue;
        existente.stockBajoAlertaIndeterminado = !todosTrue && !todosFalse;
      }
    }

    for (const grupo of map.values()) {
      const todosTrue = grupo.productos.every((p) => !!p.stockBajoAlerta);
      const todosFalse = grupo.productos.every((p) => !p.stockBajoAlerta);
      grupo.stockBajoAlertaGeneral = todosTrue;
      grupo.stockBajoAlertaIndeterminado = !todosTrue && !todosFalse;
    }

    return Array.from(map.values()).sort((a, b) =>
      a.marcaVehiculo.localeCompare(b.marcaVehiculo) ||
      a.modeloVehiculo.localeCompare(b.modeloVehiculo) ||
      a.anioVehiculo.localeCompare(b.anioVehiculo)
    );
  }
}

@Component({
  selector: 'app-catalogo-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-bold text-slate-900 mb-1">Detalle del grupo</h2>
      <p class="text-sm text-slate-500 mb-5">
        {{ data.marcaVehiculo }} {{ data.modeloVehiculo }} {{ data.anioVehiculo }} ·
        {{ data.tipoVidrio }} · {{ data.calidadVidrio }} · {{ data.nombreProveedor }}
      </p>

      <div class="overflow-x-auto rounded-lg border border-slate-200">
        <table mat-table [dataSource]="data.productos" class="w-full">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let element" class="font-mono text-xs">{{ element.idProducto }}</td>
          </ng-container>

          <ng-container matColumnDef="ubicacion">
            <th mat-header-cell *matHeaderCellDef>Ubicación</th>
            <td mat-cell *matCellDef="let element">{{ element.ubicacionAlmacen || 'Sin ubicación' }}</td>
          </ng-container>

          <ng-container matColumnDef="precioVenta">
            <th mat-header-cell *matHeaderCellDef>Precio Venta</th>
            <td mat-cell *matCellDef="let element" class="font-semibold">{{ element.precioVenta | currency : 'PEN' : 'S/' }}</td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>Stock</th>
            <td mat-cell *matCellDef="let element">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {{ element.stockActual }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>

      <div class="flex justify-end mt-5">
        <button mat-raised-button color="primary" (click)="cerrar()">Cerrar</button>
      </div>
    </div>
  `
})
export class CatalogoDetalleDialogComponent {
  displayedColumns: string[] = ['id', 'ubicacion', 'precioVenta', 'stock'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProductoAgrupado,
    private dialogRef: MatDialogRef<CatalogoDetalleDialogComponent>
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
