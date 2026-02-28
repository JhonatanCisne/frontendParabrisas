import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ProductoService } from '../productos/services/producto.service';
import { VentaService } from './services/venta.service';
import { ProductListDTO, VentaDTO, DetalleVentaListDTO } from '../../shared/models';
import { AuthService } from '../../core/services/auth.service';

interface DetalleVentaManual {
  idProducto: number;
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  tipoVidrio?: string;
  calidadVidrio?: string;
  placaVehiculo: string;
  cantidad: number;
  precioVenta: number;
  subtotal: number;
}

interface ProductoAgrupadoVenta {
  key: string;
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  tipoVidrio: string;
  calidadVidrio: string;
  nombreProveedor: string;
  precioVenta: number;
  stockTotal: number;
  productos: ProductListDTO[];
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDialogModule
  ],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
        <div class="page-icon" style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <mat-icon style="color:white;font-size:22px;width:22px;height:22px">shopping_cart</mat-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900" style="letter-spacing:-0.02em">Punto de Venta</h1>
          <p class="text-sm text-slate-500 mt-0.5">Registra y gestiona las ventas</p>
        </div>
      </div>

      <mat-tab-group>
        <!-- Pestaña Nueva Venta -->
        <mat-tab label="Nueva Venta">
          <div class="mt-4 lg:mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Panel catálogo + detalles -->
            <div class="col-span-1 lg:col-span-3">

              <!-- Placa del Vehículo -->
              <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5 mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <mat-form-field appearance="outline" class="flex-1 mb-0">
                    <mat-label>Placa del Vehículo</mat-label>
                    <input matInput [formControl]="placaControl" placeholder="ABC-1234" class="uppercase" />
                    <mat-icon matSuffix class="text-slate-400">directions_car</mat-icon>
                  </mat-form-field>
                  <p class="text-xs text-slate-400">Ingresa la placa antes de agregar productos</p>
                </div>
              </div>

              <!-- Agregar por ID rápido -->
              <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5 mb-6">
                <h2 class="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Agregar por ID de Producto</h2>
                <div class="flex flex-col sm:flex-row gap-3">
                  <mat-form-field appearance="outline" class="w-40">
                    <mat-label>ID Producto</mat-label>
                    <input matInput type="number" [formControl]="idProductoControl" placeholder="Ej: 12" min="1" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-32">
                    <mat-label>Cantidad</mat-label>
                    <input matInput type="number" [formControl]="cantidadIdControl" min="1" placeholder="1" />
                  </mat-form-field>
                  <button mat-raised-button color="primary" (click)="agregarPorId()" class="w-full sm:w-auto h-12 sm:h-14 mt-1">
                    <mat-icon class="mr-1">add_shopping_cart</mat-icon> Agregar
                  </button>
                  <div *ngIf="productoBuscadoPorId" class="flex-1 bg-slate-50 rounded-lg px-4 py-3 text-sm">
                    <span class="font-semibold text-slate-800">{{ productoBuscadoPorId.marcaVehiculo }} {{ productoBuscadoPorId.modeloVehiculo }} {{ productoBuscadoPorId.anioVehiculo }}</span>
                    <span class="text-slate-400 mx-1">·</span>
                    <span class="text-slate-600">{{ productoBuscadoPorId.tipoVidrio }} · {{ productoBuscadoPorId.calidadVidrio }}</span>
                    <span class="text-slate-400 mx-1">·</span>
                    <span class="font-semibold text-emerald-600">{{ productoBuscadoPorId.precioVenta | currency : 'PEN' : 'S/' }}</span>
                    <span class="text-slate-400 mx-1">·</span>
                    <span class="text-slate-500">Stock: {{ productoBuscadoPorId.stockActual }}</span>
                  </div>
                </div>
              </div>

              <!-- Filtros de búsqueda rápida -->
              <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-5 mb-6">
                <h2 class="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Buscar Producto en Catálogo</h2>
                <form
                  [formGroup]="filtroForm"
                  (ngSubmit)="filtrarProductos()"
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3"
                >
                  <mat-form-field appearance="outline" class="col-span-1">
                    <mat-label>Marca</mat-label>
                    <input matInput formControlName="marca" placeholder="Toyota" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col-span-1">
                    <mat-label>Modelo</mat-label>
                    <input matInput formControlName="modelo" placeholder="Corolla" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col-span-1">
                    <mat-label>Año</mat-label>
                    <input matInput formControlName="anio" placeholder="2023" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col-span-1">
                    <mat-label>Tipo</mat-label>
                    <input matInput formControlName="tipo" placeholder="Parabrisas" />
                  </mat-form-field>
                  <button mat-raised-button color="primary" type="submit" class="w-full sm:w-auto h-12 sm:h-14 self-start mt-1">
                    <mat-icon class="mr-1">search</mat-icon> Buscar
                  </button>
                  <button mat-stroked-button type="button" (click)="limpiarFiltros()" class="w-full sm:w-auto h-12 sm:h-14 self-start mt-1">
                    Limpiar
                  </button>
                </form>
              </div>

              <!-- Tabla catálogo de productos (desplegable) -->
              <div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                <div
                  class="px-4 md:px-5 py-4 border-b border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
                  (click)="catalogoExpandido = !catalogoExpandido"
                >
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-slate-400 transition-transform" [style.transform]="catalogoExpandido ? 'rotate(0)' : 'rotate(-90deg)'">expand_more</mat-icon>
                    <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wider">Productos Disponibles</h2>
                  </div>
                  <span class="text-xs text-slate-400">{{ productosFiltradosVenta.length }} resultado(s)</span>
                </div>

                <ng-container *ngIf="catalogoExpandido">
                <div *ngIf="isLoadingProductos" class="flex justify-center py-10">
                  <mat-spinner diameter="36"></mat-spinner>
                </div>

                <div *ngIf="!isLoadingProductos && productosFiltradosVenta.length > 0" class="overflow-x-auto" style="max-height: 420px; overflow-y: auto">
                  <table class="w-full min-w-[720px] border-collapse">
                    <thead class="sticky top-0 z-10">
                      <tr class="bg-slate-50">
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Año</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Calidad</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let grupo of productosFiltradosVenta; trackBy: trackByGrupo" class="border-b border-slate-100 hover:bg-emerald-50/40 transition-colors">
                        <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ grupo.marcaVehiculo }}</td>
                        <td class="px-4 py-3 text-sm text-slate-600">{{ grupo.modeloVehiculo }}</td>
                        <td class="px-4 py-3 text-center text-sm text-slate-600">{{ grupo.anioVehiculo }}</td>
                        <td class="px-4 py-3 text-sm text-slate-600">{{ grupo.tipoVidrio }}</td>
                        <td class="px-4 py-3 text-sm text-slate-600">{{ grupo.calidadVidrio }}</td>
                        <td class="px-4 py-3 text-right text-sm font-semibold text-slate-800">{{ grupo.precioVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-4 py-3 text-center">
                          <span
                            [class]="grupo.stockTotal <= 1
                              ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200'
                              : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700'"
                          >{{ grupo.stockTotal }}</span>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <button
                            mat-mini-fab
                            color="primary"
                            (click)="abrirDialogoAgregar(grupo)"
                            [disabled]="grupo.stockTotal <= 0"
                            class="w-9! h-9!"
                            matTooltip="Agregar a venta"
                          >
                            <mat-icon class="text-lg!">add_shopping_cart</mat-icon>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="!isLoadingProductos && productosFiltradosVenta.length === 0" class="py-10 text-center text-slate-400">
                  <mat-icon style="font-size:40px;width:40px;height:40px;opacity:0.4" class="mb-2">inventory_2</mat-icon>
                  <p class="text-sm">No se encontraron productos</p>
                </div>
                </ng-container>
              </div>

              <!-- Lista de detalles de venta -->
              <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-6">
                <h2 class="text-lg font-semibold text-slate-800 mb-4">
                  Detalles de Venta
                  <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{{ detallesVenta.length }}</span>
                </h2>

                <div *ngIf="detallesVenta.length > 0" class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full min-w-[680px] border-collapse">
                    <thead>
                      <tr class="bg-slate-50">
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Placa</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio Unit.</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let detalle of detallesVenta; let i = index; trackBy: trackByDetalle" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ detalle.marcaVehiculo }}</td>
                        <td class="px-4 py-3 text-sm text-slate-600">{{ detalle.modeloVehiculo }}</td>
                        <td class="px-4 py-3 text-sm text-slate-500">{{ detalle.tipoVidrio }}</td>
                        <td class="px-4 py-3 text-sm text-slate-600">{{ detalle.placaVehiculo }}</td>
                        <td class="px-4 py-3 text-center text-sm font-semibold text-slate-700">{{ detalle.cantidad }}</td>
                        <td class="px-4 py-3 text-right text-sm text-slate-600">{{ detalle.precioVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-4 py-3 text-right text-sm font-bold text-emerald-600">{{ detalle.subtotal | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-4 py-3 text-center">
                          <button mat-icon-button color="warn" (click)="eliminarDetalle(i)">
                            <mat-icon class="text-lg">delete_outline</mat-icon>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="detallesVenta.length === 0" class="py-12 text-center text-slate-400">
                  <mat-icon style="font-size:40px;width:40px;height:40px;opacity:0.4" class="mb-2">receipt_long</mat-icon>
                  <p class="text-sm">Selecciona productos del catálogo y presiona el botón <strong>+</strong> para agregarlos</p>
                </div>
              </div>
            </div>

            <!-- Panel resumen venta -->
            <div class="col-span-1">
              <mat-card class="lg:sticky lg:top-6">
                <mat-card-content class="p-4 md:p-5">
                  <h3 class="text-base font-semibold text-slate-800 mb-4">Resumen de Venta</h3>

                  <div class="space-y-3 py-4 border-t border-b border-slate-100">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Productos:</span>
                      <strong class="text-slate-800">{{ detallesVenta.length }}</strong>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Total Unidades:</span>
                      <strong class="text-slate-800">{{ totalUnidades }}</strong>
                    </div>
                  </div>

                  <div class="flex justify-between py-4 text-lg">
                    <span class="font-semibold text-slate-700">Total:</span>
                    <span class="font-bold text-emerald-600">{{ totalVenta | currency : 'PEN' : 'S/' }}</span>
                  </div>

                  <button
                    mat-raised-button
                    color="primary"
                    (click)="confirmarVenta()"
                    [disabled]="detallesVenta.length === 0 || isLoading"
                    class="w-full py-3 text-base font-semibold mt-2"
                  >
                    <span *ngIf="!isLoading">Confirmar Venta</span>
                    <span *ngIf="isLoading">Procesando...</span>
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Pestaña Buscar Venta -->
        <mat-tab label="Buscar Venta">
          <div class="mt-4 md:mt-6">
            <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-5">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">Buscar Venta</h2>

              <form
                [formGroup]="formularioBusquedaVenta"
                (ngSubmit)="buscarVenta()"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              >
                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Búsqueda</mat-label>
                  <mat-select formControlName="tipoBusqueda">
                    <mat-option value="placa">Por Placa</mat-option>
                    <mat-option value="rango">Por Rango de Fechas</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" *ngIf="formularioBusquedaVenta.get('tipoBusqueda')?.value === 'placa'">
                  <mat-label>Placa del Vehículo</mat-label>
                  <input matInput formControlName="placa" placeholder="ABC-1234" />
                </mat-form-field>

                <ng-container *ngIf="formularioBusquedaVenta.get('tipoBusqueda')?.value === 'rango'">
                  <mat-form-field appearance="outline">
                    <mat-label>Fecha Inicio</mat-label>
                    <input matInput type="date" formControlName="fechaInicio" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Fecha Fin</mat-label>
                    <input matInput type="date" formControlName="fechaFin" />
                  </mat-form-field>
                </ng-container>

                <button mat-raised-button color="primary" type="submit" class="w-full sm:w-auto h-12 sm:h-14 self-start mt-1">Buscar</button>
                <button mat-stroked-button type="button" (click)="limpiarBusquedaVenta()" class="w-full sm:w-auto h-12 sm:h-14 self-start mt-1">Limpiar</button>
              </form>

              <div *ngIf="isLoadingBusqueda" class="flex justify-center mb-6">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="detallesEncontrados.length > 0" class="rounded-xl border border-slate-200 p-4 md:p-5 bg-slate-50">
                <h3 class="font-semibold text-slate-800 text-base mb-4">Detalles Encontrados ({{ detallesEncontrados.length }})</h3>

                <div class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full min-w-[680px] border-collapse">
                    <thead>
                      <tr class="bg-slate-100">
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Placa</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let detalle of detallesEncontrados; trackBy: trackByDetalleEncontrado" class="border-b border-slate-100 hover:bg-white transition-colors">
                        <td class="px-4 py-3 text-sm font-semibold text-slate-800">{{ detalle.placaVehiculo || 'N/A' }}</td>
                        <td class="px-4 py-3 text-sm text-slate-600">{{ detalle.marcaVehiculo || 'N/A' }}</td>
                        <td class="px-4 py-3 text-sm text-slate-600">{{ detalle.modeloVehiculo || 'N/A' }}</td>
                        <td class="px-4 py-3 text-center text-sm font-semibold">{{ detalle.cantidad }}</td>
                        <td class="px-4 py-3 text-right text-sm">{{ detalle.precioVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-4 py-3 text-right text-sm font-semibold text-emerald-600">{{ detalle.subtotal | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-4 py-3 text-sm text-slate-500">{{ detalle.fecha | date : 'short' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div *ngIf="ventaNoEncontrada && !isLoadingBusqueda" class="py-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                No se encontraron ventas con los criterios especificados
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Pestaña Historial de Ventas -->
        <mat-tab label="Historial de Ventas">
          <div class="mt-4 md:mt-6">
            <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">Historial de Ventas</h2>

              <div *ngIf="isLoadingHistorial" class="flex justify-center py-12">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="!isLoadingHistorial && historialsVentas.length > 0" class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr class="bg-slate-50">
                      <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Venta</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Placa</th>
                      <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto Total (S/)</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ng-container *ngFor="let venta of historialsVentas; trackBy: trackByVentaHistorial">
                      <tr class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors" (click)="toggleExpandVenta(venta.idVenta || 0)">
                        <td class="px-4 py-3 text-center text-sm font-mono font-semibold text-slate-700">{{ venta.idVenta }}</td>
                        <td class="px-4 py-3 text-sm font-semibold text-slate-800">{{ venta.placaVehiculo || (venta.detalles && venta.detalles[0] ? venta.detalles[0]['placaVehiculo'] : 'N/A') }}</td>
                        <td class="px-4 py-3 text-right text-sm font-bold text-emerald-600">{{ venta.totalVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-4 py-3 text-sm text-slate-500">{{ venta.fecha | date : 'short' }}</td>
                      </tr>
                      <ng-container *ngIf="expandedVentaId === venta.idVenta && venta.detalles && venta.detalles.length > 0">
                        <tr *ngFor="let detalle of venta.detalles; trackBy: trackByDetalleVenta" class="bg-blue-50/50 border-b border-blue-100/50">
                          <td class="px-4 py-2.5 text-xs">
                            <span class="font-semibold text-slate-700">{{ detalle.marcaVehiculo }} {{ detalle.modeloVehiculo }}</span>
                            <br/>
                            <span class="text-slate-400">{{ detalle.tipoVidrio }} • {{ detalle.calidadVidrio }}</span>
                          </td>
                          <td class="px-4 py-2.5 text-xs text-slate-600">{{ detalle.placaVehiculo }}</td>
                          <td class="px-4 py-2.5 text-right">
                            <div class="text-xs text-slate-500">Cant: {{ detalle.cantidad }}</div>
                            <div class="text-xs font-semibold text-emerald-600">{{ (detalle.precioVenta * detalle.cantidad) | currency : 'PEN' : 'S/' }}</div>
                          </td>
                          <td class="px-4 py-2.5"></td>
                        </tr>
                      </ng-container>
                    </ng-container>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!isLoadingHistorial && historialsVentas.length === 0" class="py-12 text-center text-slate-400">
                <mat-icon style="font-size:40px;width:40px;height:40px;opacity:0.4" class="mb-2">receipt</mat-icon>
                <p class="text-sm">No hay ventas registradas en el sistema</p>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-tab-labels {
      border-bottom: 1px solid #e2e8f0;
    }
  `]
})
export class VentasComponent implements OnInit {
  filtroForm: FormGroup;
  placaControl = new FormControl('', Validators.required);
  idProductoControl = new FormControl<number | null>(null);
  cantidadIdControl = new FormControl(1, [Validators.required, Validators.min(1)]);
  productoBuscadoPorId: ProductListDTO | null = null;
  formularioBusquedaVenta: FormGroup;

  detallesVenta: DetalleVentaManual[] = [];
  productosDisponibles: ProductListDTO[] = [];
  productosFiltradosVenta: ProductoAgrupadoVenta[] = [];
  productosAgrupadosVenta: ProductoAgrupadoVenta[] = [];
  ventasEncontradas: any[] = [];
  detallesEncontrados: any[] = [];
  ventaNoEncontrada = false;
  historialsVentas: VentaDTO[] = [];
  detallesHistorialVentas: any[] = [];

  totalVenta = 0;
  totalUnidades = 0;
  isLoading = false;
  isLoadingProductos = false;
  isLoadingBusqueda = false;
  isLoadingHistorial = false;
  expandedVentaId: number | null = null;
  catalogoExpandido = true;

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.filtroForm = this.fb.group({
      marca: [''],
      modelo: [''],
      anio: [''],
      tipo: ['']
    });

    this.formularioBusquedaVenta = this.fb.group({
      tipoBusqueda: ['placa'],
      placa: [''],
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarHistorialVentas();
  }

  cargarProductos(): void {
    this.isLoadingProductos = true;
    this.cdr.detectChanges();
    this.productoService.getCatalogo().subscribe({
      next: (data: ProductListDTO[]) => {
        this.productosDisponibles = data;
        this.productosAgrupadosVenta = this.agruparProductosVenta(data);
        this.productosFiltradosVenta = [...this.productosAgrupadosVenta];
        this.isLoadingProductos = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar');
        this.isLoadingProductos = false;
        this.cdr.detectChanges();
      }
    });
  }

  private agruparProductosVenta(productos: ProductListDTO[]): ProductoAgrupadoVenta[] {
    const map = new Map<string, ProductoAgrupadoVenta>();

    for (const p of productos) {
      const key = [p.marcaVehiculo, p.modeloVehiculo, p.anioVehiculo, p.tipoVidrio, p.calidadVidrio, p.nombreProveedor].join('|');
      const existente = map.get(key);

      if (!existente) {
        map.set(key, {
          key,
          marcaVehiculo: p.marcaVehiculo,
          modeloVehiculo: p.modeloVehiculo,
          anioVehiculo: p.anioVehiculo,
          tipoVidrio: p.tipoVidrio,
          calidadVidrio: p.calidadVidrio,
          nombreProveedor: p.nombreProveedor,
          precioVenta: p.precioVenta,
          stockTotal: p.stockActual,
          productos: [p]
        });
      } else {
        existente.productos.push(p);
        existente.stockTotal += p.stockActual;
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.marcaVehiculo.localeCompare(b.marcaVehiculo) ||
      a.modeloVehiculo.localeCompare(b.modeloVehiculo)
    );
  }

  filtrarProductos(): void {
    const f = this.filtroForm.value;
    this.productosFiltradosVenta = this.productosAgrupadosVenta.filter(g => {
      if (f.marca && !g.marcaVehiculo.toLowerCase().includes(f.marca.toLowerCase())) return false;
      if (f.modelo && !g.modeloVehiculo.toLowerCase().includes(f.modelo.toLowerCase())) return false;
      if (f.anio && !g.anioVehiculo.includes(f.anio)) return false;
      if (f.tipo && !g.tipoVidrio.toLowerCase().includes(f.tipo.toLowerCase())) return false;
      return true;
    });
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.productosFiltradosVenta = [...this.productosAgrupadosVenta];
    this.cdr.detectChanges();
  }

  agregarPorId(): void {
    const id = this.idProductoControl.value;
    const cantidad = this.cantidadIdControl.value || 1;
    const placa = this.placaControl.value?.trim();

    if (!placa) {
      this.snackBar.open('Ingresa la placa del vehículo primero', 'Cerrar', { duration: 3000 });
      return;
    }
    if (!id || id <= 0) {
      this.snackBar.open('Ingresa un ID de producto válido', 'Cerrar', { duration: 3000 });
      return;
    }

    // Buscar el producto en la lista ya cargada
    const producto = this.productosDisponibles.find(p => p.idProducto === id);
    if (!producto) {
      this.snackBar.open('Producto con ese ID no encontrado', 'Cerrar', { duration: 3000 });
      this.productoBuscadoPorId = null;
      return;
    }
    if (producto.stockActual <= 0) {
      this.snackBar.open('El producto no tiene stock disponible', 'Cerrar', { duration: 3000 });
      this.productoBuscadoPorId = producto;
      return;
    }
    if (cantidad > producto.stockActual) {
      this.snackBar.open(`Stock insuficiente. Disponible: ${producto.stockActual}`, 'Cerrar', { duration: 3000 });
      this.productoBuscadoPorId = producto;
      return;
    }

    this.productoBuscadoPorId = producto;

    const detalle: DetalleVentaManual = {
      idProducto: producto.idProducto,
      marcaVehiculo: producto.marcaVehiculo,
      modeloVehiculo: producto.modeloVehiculo,
      anioVehiculo: producto.anioVehiculo,
      tipoVidrio: producto.tipoVidrio,
      calidadVidrio: producto.calidadVidrio,
      placaVehiculo: placa,
      cantidad: cantidad,
      precioVenta: producto.precioVenta,
      subtotal: producto.precioVenta * cantidad
    };
    this.detallesVenta.push(detalle);
    this.actualizarTotales();
    this.snackBar.open('Producto agregado a la venta', 'Cerrar', { duration: 2000 });
    this.idProductoControl.reset();
    this.cantidadIdControl.setValue(1);
  }

  abrirDialogoAgregar(grupo: ProductoAgrupadoVenta): void {
    const placa = this.placaControl.value?.trim();
    if (!placa) {
      this.snackBar.open('Ingresa la placa del vehículo primero', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(AgregarVentaDialogComponent, {
      width: '480px',
      data: { grupo, placa }
    });

    dialogRef.afterClosed().subscribe((result: { producto: ProductListDTO; cantidad: number; placa: string } | undefined) => {
      if (result) {
        const detalle: DetalleVentaManual = {
          idProducto: result.producto.idProducto,
          marcaVehiculo: result.producto.marcaVehiculo,
          modeloVehiculo: result.producto.modeloVehiculo,
          anioVehiculo: result.producto.anioVehiculo,
          tipoVidrio: result.producto.tipoVidrio,
          calidadVidrio: result.producto.calidadVidrio,
          placaVehiculo: result.placa,
          cantidad: result.cantidad,
          precioVenta: result.producto.precioVenta,
          subtotal: result.producto.precioVenta * result.cantidad
        };
        this.detallesVenta.push(detalle);
        this.actualizarTotales();
        this.snackBar.open('Producto agregado a la venta', 'Cerrar', { duration: 2000 });
      }
    });
  }

  cargarHistorialVentas(): void {
    this.isLoadingHistorial = true;
    this.cdr.detectChanges();
    this.ventaService.listarVentas().subscribe({
      next: (data: VentaDTO[]) => {
        console.log('Ventas cargadas:', data);
        this.historialsVentas = data;
        this.detallesHistorialVentas = this.expandirDetalles(data);
        this.isLoadingHistorial = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoadingHistorial = false;
        console.error('Error cargando historial de ventas:', error);
        this.snackBar.open('Error al cargar historial', 'Cerrar');
        this.cdr.detectChanges();
      }
    });
  }

  eliminarDetalle(index: number): void {
    this.detallesVenta.splice(index, 1);
    this.actualizarTotales();
  }

  actualizarTotales(): void {
    this.totalVenta = this.detallesVenta.reduce((total, item) => total + item.subtotal, 0);
    this.totalUnidades = this.detallesVenta.reduce((total, item) => total + item.cantidad, 0);
  }

  confirmarVenta(): void {
    if (this.detallesVenta.length === 0) return;

    const idUsuario = this.authService.getCurrentUserId();

    if (idUsuario === 0) {
      this.snackBar.open('Error: No se pudo obtener el ID del usuario. Por favor vuelve a iniciar sesión.', 'Cerrar', {
        duration: 6000
      });
      return;
    }

    // Establecer isLoading antes del subscribe para evitar ExpressionChangedAfterItHasBeenCheckedError
    this.isLoading = true;

    // Obtener la placa del primer detalle
    const placaPrincipal = this.detallesVenta[0]?.placaVehiculo || '';

    const detalles: DetalleVentaListDTO[] = this.detallesVenta.map(d => ({
      idProducto: d.idProducto,
      marcaVehiculo: d.marcaVehiculo,
      modeloVehiculo: d.modeloVehiculo,
      anioVehiculo: d.anioVehiculo,
      tipoVidrio: d.tipoVidrio || '',
      calidadVidrio: d.calidadVidrio || '',
      placaVehiculo: d.placaVehiculo,
      cantidad: d.cantidad,
      precioVenta: d.precioVenta
    }));

    const venta: VentaDTO = {
      idUsuario: idUsuario,
      totalVenta: this.totalVenta,
      detalles: detalles,
      placaVehiculo: placaPrincipal
    };

    console.log('Enviando venta al backend:', JSON.stringify(venta, null, 2));

    this.ventaService.crearVenta(venta).subscribe({
      next: (response) => {
        Promise.resolve().then(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.snackBar.open('Venta registrada correctamente', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.detallesVenta = [];
          this.totalVenta = 0;
          this.totalUnidades = 0;
          this.placaControl.reset();
          this.cargarProductos();
        });
      },
      error: (error: any) => {
        const mensaje = error?.error?.mensaje || error?.error?.message || error?.error?.detalle || 'Error desconocido al guardar venta';
        console.error('Error completo:', error);
        console.error('Respuesta:', error?.error);
        Promise.resolve().then(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.snackBar.open('Error: ' + mensaje, 'Cerrar', {
            duration: 6000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        });
      }
    });
  }

  private expandirDetalles(ventas: any[]): any[] {
    const detallesExpandidos: any[] = [];
    ventas.forEach((venta: any) => {
      if (venta.detalles && Array.isArray(venta.detalles)) {
        venta.detalles.forEach((detalle: any) => {
          detallesExpandidos.push({
            idVenta: venta.idVenta,
            ...detalle,
            fecha: venta.fecha,
            subtotal: detalle.precioVenta * detalle.cantidad
          });
        });
      }
    });
    return detallesExpandidos;
  }

  buscarVenta(): void {
    const tipoBusqueda = this.formularioBusquedaVenta.get('tipoBusqueda')?.value;

    this.isLoadingBusqueda = true;
    this.detallesEncontrados = [];
    this.ventaNoEncontrada = false;
    this.cdr.detectChanges();

    if (tipoBusqueda === 'placa') {
      const placa = this.formularioBusquedaVenta.get('placa')?.value;
      if (!placa) {
        this.snackBar.open('Por favor ingresa una placa', 'Cerrar');
        this.isLoadingBusqueda = false;
        this.cdr.detectChanges();
        return;
      }

      this.ventaService.buscarPorPlaca(placa).subscribe({
        next: (data) => {
          const ventasData = Array.isArray(data) ? data : [data];
          this.detallesEncontrados = this.expandirDetalles(ventasData);
          if (this.detallesEncontrados.length === 0) {
            this.ventaNoEncontrada = true;
          }
          this.isLoadingBusqueda = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoadingBusqueda = false;
          this.ventaNoEncontrada = true;
          this.cdr.detectChanges();
        }
      });
    } else if (tipoBusqueda === 'rango') {
      const fechaInicio = this.formularioBusquedaVenta.get('fechaInicio')?.value;
      const fechaFin = this.formularioBusquedaVenta.get('fechaFin')?.value;

      if (!fechaInicio || !fechaFin) {
        this.snackBar.open('Por favor completa ambas fechas', 'Cerrar');
        this.isLoadingBusqueda = false;
        this.cdr.detectChanges();
        return;
      }

      this.ventaService.buscarPorRangoFechas(fechaInicio, fechaFin).subscribe({
        next: (data) => {
          const ventasData = Array.isArray(data) ? data : [data];
          this.detallesEncontrados = this.expandirDetalles(ventasData);
          if (this.detallesEncontrados.length === 0) {
            this.ventaNoEncontrada = true;
          }
          this.isLoadingBusqueda = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoadingBusqueda = false;
          this.ventaNoEncontrada = true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  limpiarBusquedaVenta(): void {
    this.formularioBusquedaVenta.reset({
      tipoBusqueda: 'placa'
    });
    this.ventasEncontradas = [];
    this.detallesEncontrados = [];
    this.ventaNoEncontrada = false;
  }

  // TrackBy functions para optimizar *ngFor
  trackByProducto(index: number, item: any): number {
    return item.idProducto || index;
  }

  trackByGrupo(index: number, item: ProductoAgrupadoVenta): string {
    return item.key;
  }

  trackByDetalle(index: number, item: any): number {
    return index;
  }

  trackByVenta(index: number, item: any): number {
    return index;
  }

  trackByVentaHistorial(index: number, item: VentaDTO): number {
    return index;
  }

  trackByDetalleEncontrado(index: number, item: any): number {
    return item.idDetalleVenta || index;
  }

  trackByDetalleHistorial(index: number, item: any): number {
    return item.idDetalleVenta || index;
  }

  toggleExpandVenta(ventaId: number): void {
    this.expandedVentaId = this.expandedVentaId === ventaId ? null : ventaId;
  }

  trackByDetalleVenta(index: number, item: any): number {
    return item.idDetalleVenta || index;
  }
}

// ====== Dialog para agregar producto a la venta ======
@Component({
  selector: 'app-agregar-venta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-lg font-bold text-slate-900 mb-1">Agregar a Venta</h2>
      <p class="text-sm text-slate-500 mb-5">
        {{ data.grupo.marcaVehiculo }} {{ data.grupo.modeloVehiculo }} {{ data.grupo.anioVehiculo }} · {{ data.grupo.tipoVidrio }} · {{ data.grupo.calidadVidrio }}
      </p>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4">
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Precio</p>
            <p class="text-lg font-bold text-emerald-600">{{ data.grupo.precioVenta | currency : 'PEN' : 'S/' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wider mb-1">Stock Total</p>
            <p class="text-lg font-bold text-slate-800">{{ data.grupo.stockTotal }}</p>
          </div>
        </div>

        <mat-form-field appearance="outline" class="w-full" *ngIf="data.grupo.productos.length > 1">
          <mat-label>Seleccionar unidad</mat-label>
          <mat-select [formControl]="productoSeleccionado">
            <mat-option *ngFor="let p of data.grupo.productos" [value]="p">
              ID: {{ p.idProducto }} · Stock: {{ p.stockActual }} · {{ p.ubicacionAlmacen || 'Sin ubicación' }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Cantidad</mat-label>
          <input matInput type="number" [formControl]="cantidadControl" min="1" [max]="maxCantidad" />
          <mat-hint>Máximo disponible: {{ maxCantidad }}</mat-hint>
        </mat-form-field>

        <div class="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
          <span class="text-sm text-slate-600">Placa:</span>
          <span class="font-semibold text-slate-800 uppercase">{{ data.placa }}</span>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button mat-stroked-button type="button" (click)="cancelar()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="agregar()" [disabled]="!isValid()">
          <mat-icon class="mr-1">add_shopping_cart</mat-icon> Agregar
        </button>
      </div>
    </div>
  `
})
export class AgregarVentaDialogComponent {
  productoSeleccionado = new FormControl<ProductListDTO | null>(null);
  cantidadControl = new FormControl(1, [Validators.required, Validators.min(1)]);

  get maxCantidad(): number {
    const prod = this.productoSeleccionado.value;
    return prod ? prod.stockActual : this.data.grupo.stockTotal;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { grupo: ProductoAgrupadoVenta; placa: string },
    private dialogRef: MatDialogRef<AgregarVentaDialogComponent>,
    private fb: FormBuilder
  ) {
    // Si solo hay un producto, seleccionarlo automáticamente
    if (data.grupo.productos.length === 1) {
      this.productoSeleccionado.setValue(data.grupo.productos[0]);
    }
  }

  isValid(): boolean {
    const prod = this.productoSeleccionado.value;
    const cant = this.cantidadControl.value || 0;
    return !!prod && cant > 0 && cant <= prod.stockActual;
  }

  agregar(): void {
    if (!this.isValid()) return;
    this.dialogRef.close({
      producto: this.productoSeleccionado.value,
      cantidad: this.cantidadControl.value,
      placa: this.data.placa
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
