import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { CompraService } from './services/compra.service';
import { ProveedorService } from '../proveedores/services/proveedor.service';
import { CompraDTO, DetalleListCompraDTO, ProveedorDTO } from '../../shared/models';
import { AuthService } from '../../core/services/auth.service';

interface DetalleCompraManual {
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  tipoVidrio: string;
  calidadVidrio: string;
  idProveedor: number;
  nombreProveedor: string;
  cantidad: number;
  costoCompra: number;
  precioVenta: number;
  subtotal: number;
  ubicacionAlmacen: string;
}

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
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex items-center gap-3 mb-6">
        <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <mat-icon style="color:white;font-size:22px;width:22px;height:22px">shopping_bag</mat-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900" style="letter-spacing:-0.02em">Ingreso de Inventario</h1>
          <p class="text-sm text-slate-500 mt-0.5">Registra compras y nuevos productos</p>
        </div>
      </div>

      <mat-tab-group>
        <!-- Pestaña Nueva Compra Manual -->
        <mat-tab label="Nueva Compra">
          <div class="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <!-- Panel de formulario de producto -->
            <div class="md:col-span-3">
              <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-4 md:mb-5">
                <h2 class="text-lg font-semibold text-slate-800 mb-4">Registrar Producto y Compra</h2>

                <form #compraFormDir="ngForm" [formGroup]="formularioProductoCompra" (ngSubmit)="agregarDetalleALista()" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Marca Vehículo</mat-label>
                    <input matInput formControlName="marcaVehiculo" placeholder="Ej: Chevrolet" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Modelo Vehículo</mat-label>
                    <input matInput formControlName="modeloVehiculo" placeholder="Ej: Aveo" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Año</mat-label>
                    <input matInput type="number" formControlName="anioVehiculo" placeholder="2020" min="1990" max="2050" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Posición Vidrio</mat-label>
                    <mat-select formControlName="tipoVidrio">
                      <mat-option value="">Seleccionar</mat-option>
                      <mat-option value="Delantero">Delantero</mat-option>
                      <mat-option value="Posterior">Posterior</mat-option>
                      <mat-option value="Puerta">Puerta</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Tipo Vidrio</mat-label>
                    <mat-select formControlName="calidadVidrio">
                      <mat-option value="">Seleccionar</mat-option>
                      <mat-option value="Templado">Templado</mat-option>
                      <mat-option value="Laminado">Laminado</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Proveedor</mat-label>
                    <mat-select formControlName="idProveedor">
                      <mat-option value="">-- Seleccionar Proveedor --</mat-option>
                      <mat-option *ngFor="let prov of proveedores; trackBy: trackByProveedor" [value]="prov.idProveedor">
                        {{ prov.nombreProveedor }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Cantidad</mat-label>
                    <input matInput type="number" formControlName="cantidad" placeholder="1" min="1" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Costo Compra (S/)</mat-label>
                    <input matInput type="number" formControlName="costoCompra" placeholder="0.00" min="0.01" step="0.01" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Precio Venta (S/)</mat-label>
                    <input matInput type="number" formControlName="precioVenta" placeholder="0.00" min="0" step="0.01" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full col-span-1 md:col-span-3">
                    <mat-label>Ubicación Almacén *</mat-label>
                    <input matInput formControlName="ubicacionAlmacen" placeholder="Ej: Almacén A, Estante 5" />
                  </mat-form-field>

                  <div class="col-span-1 md:col-span-3 flex flex-col md:flex-row gap-3">
                    <button mat-raised-button color="accent" type="submit" class="flex-1">
                      <mat-icon class="mr-1">add</mat-icon> Agregar a Lista
                    </button>
                    <button mat-stroked-button type="button" (click)="limpiarFormularioProducto()" class="flex-1">
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              <!-- Lista de detalles de compra -->
              <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <h2 class="text-lg font-semibold text-slate-800 mb-4">
                  Detalles de Compra
                  <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{{ detallesCompra.length }}</span>
                </h2>

                <div *ngIf="detallesCompra.length > 0" class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full border-collapse text-xs md:text-sm">
                    <thead>
                      <tr class="bg-slate-50">
                        <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca</th>
                        <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                        <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Año</th>
                        <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Calidad</th>
                        <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
                        <th class="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                        <th class="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo</th>
                        <th class="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">P. Vta</th>
                        <th class="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                        <th class="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let detalle of detallesCompra; let i = index; trackBy: trackByDetalle" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="px-3 py-3 font-medium text-slate-900">{{ detalle.marcaVehiculo }}</td>
                        <td class="px-3 py-3 text-slate-600">{{ detalle.modeloVehiculo }}</td>
                        <td class="px-3 py-3 text-slate-600">{{ detalle.anioVehiculo }}</td>
                        <td class="px-3 py-3 text-slate-600">{{ detalle.tipoVidrio }}</td>
                        <td class="px-3 py-3 text-slate-600">{{ detalle.calidadVidrio }}</td>
                        <td class="px-3 py-3 text-xs font-semibold text-slate-700">{{ detalle.ubicacionAlmacen }}</td>
                        <td class="px-3 py-3 text-center font-semibold text-slate-700">{{ detalle.cantidad }}</td>
                        <td class="px-3 py-3 text-right text-slate-600">{{ detalle.costoCompra | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-3 py-3 text-right text-slate-600">{{ detalle.precioVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-3 py-3 text-right font-bold text-blue-600">{{ detalle.subtotal | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-3 py-3 text-center">
                          <button mat-icon-button color="warn" (click)="eliminarDetalle(i)">
                            <mat-icon class="text-lg">delete_outline</mat-icon>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="detallesCompra.length === 0" class="py-12 text-center text-slate-400 text-sm">
                  <mat-icon style="font-size:40px;width:40px;height:40px;opacity:0.4" class="mb-2">inventory</mat-icon>
                  <p>No hay productos agregados. Completa el formulario y presiona "Agregar a Lista"</p>
                </div>
              </div>
            </div>

            <!-- Panel resumen compra -->
            <div class="md:col-span-1">
              <mat-card class="md:sticky md:top-6">
                <mat-card-content class="p-5 text-sm md:text-base">
                  <h3 class="text-base font-semibold text-slate-800 mb-4">Resumen de Compra</h3>

                  <div class="space-y-3 py-4 border-t border-b border-slate-100">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Productos:</span>
                      <strong class="text-slate-800">{{ detallesCompra.length }}</strong>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Total Unidades:</span>
                      <strong class="text-slate-800">{{ totalUnidades }}</strong>
                    </div>
                  </div>

                  <div class="space-y-2 py-4">
                    <div class="flex justify-between text-base">
                      <span class="font-semibold text-slate-700">Total Costo:</span>
                      <span class="font-bold text-blue-600">{{ totalCosto | currency : 'PEN' : 'S/' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Total Venta:</span>
                      <span class="font-semibold text-emerald-600">{{ totalVenta | currency : 'PEN' : 'S/' }}</span>
                    </div>
                  </div>

                  <button
                    mat-raised-button
                    color="primary"
                    (click)="confirmarCompra()"
                    [disabled]="detallesCompra.length === 0 || isLoading"
                    class="w-full py-2 md:py-3 text-base font-semibold mt-2"
                  >
                    <span *ngIf="!isLoading">Confirmar Compra</span>
                    <mat-spinner *ngIf="isLoading" diameter="20" class="inline-block"></mat-spinner>
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Pestaña Buscar Compra -->
        <mat-tab label="Buscar Compra">
          <div class="mt-4 md:mt-6">
            <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-6 mb-4 md:mb-5">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">Buscar Compra</h2>

              <form [formGroup]="formularioBusquedaCompra" (ngSubmit)="buscarCompra()" class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
                <mat-form-field appearance="outline" class="col-span-2 md:col-span-1 w-full">
                  <mat-label>Tipo de Búsqueda</mat-label>
                  <mat-select formControlName="tipoRangoFechas">
                    <mat-option value="idCompra">Por ID</mat-option>
                    <mat-option value="rango">Por Rango de Fechas</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" *ngIf="formularioBusquedaCompra.get('tipoRangoFechas')?.value === 'idCompra'" class="col-span-2 md:col-span-1 w-full">
                  <mat-label>ID Compra</mat-label>
                  <input matInput type="number" formControlName="idCompra" placeholder="1" />
                </mat-form-field>

                <ng-container *ngIf="formularioBusquedaCompra.get('tipoRangoFechas')?.value === 'rango'">
                  <mat-form-field appearance="outline" class="col-span-1 md:col-span-1 w-full">
                    <mat-label>Fecha Inicio</mat-label>
                    <input matInput type="date" formControlName="fechaInicio" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col-span-1 md:col-span-1 w-full">
                    <mat-label>Fecha Fin</mat-label>
                    <input matInput type="date" formControlName="fechaFin" />
                  </mat-form-field>
                </ng-container>

                <button mat-raised-button color="primary" type="submit" class="col-span-1 h-14 self-start mt-1">Buscar</button>
                <button mat-stroked-button type="button" (click)="limpiarBusquedaCompra()" class="col-span-1 h-14 self-start mt-1">Limpiar</button>
              </form>

              <div *ngIf="isLoadingBusquedaCompra" class="flex justify-center mb-6">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="compraEncontrada" class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-6">
                <h3 class="font-semibold text-slate-800 text-base mb-4">Compra #{{ compraEncontrada.idCompra }}</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p class="text-slate-400 text-xs uppercase tracking-wider mb-1">Proveedor</p>
                    <p class="font-semibold text-slate-800">{{ compraEncontrada.nombreProveedor }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400 text-xs uppercase tracking-wider mb-1">Fecha</p>
                    <p class="font-semibold text-slate-800">{{ compraEncontrada.fechaCompra | date : 'short' }}</p>
                  </div>
                  <div class="col-span-1 md:col-span-2">
                    <p class="text-slate-400 text-xs uppercase tracking-wider mb-1">Total</p>
                    <p class="font-bold text-blue-600 text-lg">{{ compraEncontrada.totalCompra | currency : 'PEN' : 'S/' }}</p>
                  </div>
                </div>

                <h4 class="font-semibold text-slate-700 mb-3 text-sm">Productos:</h4>
                <div class="overflow-x-auto rounded-lg border border-slate-200">
                  <table class="w-full border-collapse text-xs md:text-sm">
                    <thead>
                      <tr class="bg-slate-100">
                        <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marca</th>
                        <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                        <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Año</th>
                        <th class="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
                        <th class="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                        <th class="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo</th>
                        <th class="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of compraEncontrada.detalle; trackBy: trackByDetalleBusqueda" class="border-b border-slate-100">
                        <td class="px-3 py-2.5 font-medium text-slate-800">{{ item.marcaVehiculo || 'N/A' }}</td>
                        <td class="px-3 py-2.5 text-slate-600">{{ item.modeloVehiculo || 'N/A' }}</td>
                        <td class="px-3 py-2.5 text-slate-600">{{ item.anioVehiculo || 'N/A' }}</td>
                        <td class="px-3 py-2.5 text-xs font-semibold text-slate-700">{{ item.ubicacionAlmacen || 'N/A' }}</td>
                        <td class="px-3 py-2.5 text-center font-semibold">{{ item.cantidad }}</td>
                        <td class="px-3 py-2.5 text-right text-slate-600">{{ item.costoCompra | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-3 py-2.5 text-right font-semibold text-blue-600">{{ (item.costoCompra * item.cantidad) | currency : 'PEN' : 'S/' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div *ngIf="compraNoEncontrada" class="py-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200 text-sm">
                No se encontró compra con ese ID
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Pestaña Historial de Compras -->
        <mat-tab label="Historial de Compras">
          <div class="mt-4 md:mt-6">
            <div class="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">Historial de Compras</h2>

              <div *ngIf="isLoadingHistorial" class="flex justify-center py-12">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="!isLoadingHistorial && historialCompras.length > 0" class="overflow-x-auto rounded-lg border border-slate-200">
                <table class="w-full border-collapse text-xs md:text-sm">
                  <thead>
                    <tr class="bg-slate-50">
                      <th class="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" style="width: 40px;"></th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                      <th class="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total (S/)</th>
                      <th class="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ng-container *ngFor="let compra of historialCompras; trackBy: trackByCompra">
                      <tr class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors" (click)="toggleExpandCompra(compra.idCompra || 0)">
                        <td class="px-3 py-3 text-center">
                          <mat-icon class="text-slate-400 text-sm" style="font-size:18px;width:18px;height:18px;transition:transform .2s" [ngClass]="{'rotate-90': expandedCompraId === compra.idCompra}">chevron_right</mat-icon>
                        </td>
                        <td class="px-3 py-3 font-semibold text-slate-800">{{ compra.nombreProveedor }}</td>
                        <td class="px-3 py-3 text-right font-bold text-blue-600">{{ compra.totalCompra | currency : 'PEN' : 'S/' }}</td>
                        <td class="px-3 py-3 text-slate-500">{{ compra.fechaCompra | date : 'short' }}</td>
                      </tr>
                      <ng-container *ngIf="expandedCompraId === compra.idCompra && compra.detalle && compra.detalle.length > 0">
                        <tr *ngFor="let detalle of compra.detalle; trackBy: trackByDetalleCompra" class="bg-blue-50/50 border-b border-blue-100/50">
                          <td class="px-3 py-2"></td>
                          <td class="px-3 py-2 text-xs">
                            <span class="font-semibold text-slate-700">{{ detalle.marcaVehiculo }} {{ detalle.modeloVehiculo }}</span>
                            <br/>
                            <span class="text-slate-400">{{ detalle.tipoVidrio }} • {{ detalle.calidadVidrio }} • {{ detalle.ubicacionAlmacen }}</span>
                          </td>
                          <td class="px-3 py-2 text-right">
                            <div class="text-xs text-slate-500">Cant: {{ detalle.cantidad }}</div>
                            <div class="text-xs font-semibold text-blue-600">{{ (detalle.costoCompra * detalle.cantidad) | currency : 'PEN' : 'S/' }}</div>
                          </td>
                          <td class="px-3 py-2"></td>
                        </tr>
                      </ng-container>
                    </ng-container>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!isLoadingHistorial && historialCompras.length === 0" class="py-12 text-center text-slate-400 text-sm">
                <mat-icon style="font-size:40px;width:40px;height:40px;opacity:0.4" class="mb-2">shopping_bag</mat-icon>
                <p>No hay compras registradas en el sistema</p>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-mdc-form-field {
        width: 100%;
      }
      .mat-mdc-tab-labels {
        border-bottom: 1px solid #e2e8f0;
      }
      @media (max-width: 768px) {
        .mat-mdc-tab-labels {
          min-width: auto !important;
        }
        .mat-mdc-tab-label {
          min-width: auto !important;
          padding: 0 12px !important;
        }
      }
    }

    .rotate-90 {
      transform: rotate(90deg);
    }
  `]
})
export class ComprasComponent implements OnInit {
  @ViewChild('compraFormDir') compraFormDir!: FormGroupDirective;

  formularioProductoCompra: FormGroup;
  formularioBusquedaCompra: FormGroup;

  detallesCompra: DetalleCompraManual[] = [];
  proveedores: ProveedorDTO[] = [];
  compraEncontrada: CompraDTO | null = null;
  compraNoEncontrada = false;
  historialCompras: CompraDTO[] = [];

  totalCosto = 0;
  totalVenta = 0;
  totalUnidades = 0;
  isLoading = false;
  isLoadingProveedores = false;
  isLoadingBusquedaCompra = false;
  isLoadingHistorial = false;
  expandedCompraId: number | null = null;

  constructor(
    private compraService: CompraService,
    private proveedorService: ProveedorService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.formularioProductoCompra = this.fb.group({
      marcaVehiculo: ['', [Validators.required]],
      modeloVehiculo: ['', [Validators.required]],
      anioVehiculo: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      tipoVidrio: ['', [Validators.required]],
      calidadVidrio: ['', [Validators.required]],
      idProveedor: ['', [Validators.required]],
      cantidad: ['1', [Validators.required, Validators.min(1)]],
      costoCompra: ['', [Validators.required, (control: AbstractControl) => {
        const value = parseFloat(control.value);
        return value >= 0.01 ? null : { minValue: true };
      }]],
      precioVenta: ['', [Validators.required, Validators.min(0)]],
      ubicacionAlmacen: ['', [Validators.required]]
    }, { validators: (formGroup: AbstractControl) => {
      const costoCompra = formGroup.get('costoCompra')?.value;
      const precioVenta = formGroup.get('precioVenta')?.value;
      if (costoCompra && precioVenta) {
        const costo = parseFloat(costoCompra);
        const precio = parseFloat(precioVenta);
        if (!isNaN(costo) && !isNaN(precio) && costo > precio) {
          return { precioInvalido: true };
        }
      }
      return null;
    }});

    this.formularioBusquedaCompra = this.fb.group({
      tipoRangoFechas: ['idCompra'],
      idCompra: [''],
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  validarPreciosCompraVenta(formGroup: any): any {
    const costoCompra = formGroup.get('costoCompra')?.value;
    const precioVenta = formGroup.get('precioVenta')?.value;
    
    if (costoCompra && precioVenta) {
      const costo = parseFloat(costoCompra);
      const precio = parseFloat(precioVenta);
      
      if (costo > precio) {
        return { precioInvalido: true };
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.cargarProveedores();
    this.cargarHistorialCompras();
  }

  cargarProveedores(): void {
    this.isLoadingProveedores = true;
    this.proveedorService.listarProveedores().subscribe({
      next: (data: ProveedorDTO[]) => {
        this.proveedores = data;
        this.isLoadingProveedores = false;
      },
      error: (error: any) => {
        this.isLoadingProveedores = false;
        console.error('Error cargando proveedores:', error);
        this.snackBar.open('Error al cargar proveedores', 'Cerrar');
      }
    });
  }

  cargarHistorialCompras(): void {
    this.isLoadingHistorial = true;
    this.compraService.listarCompras().subscribe({
      next: (data: CompraDTO[]) => {
        this.historialCompras = data;
        this.isLoadingHistorial = false;
      },
      error: (error: any) => {
        this.isLoadingHistorial = false;
        console.error('Error cargando historial de compras:', error);
        this.snackBar.open('Error al cargar historial', 'Cerrar');
      }
    });
  }

  agregarDetalleALista(): void {
    if (!this.formularioProductoCompra.valid) {
      this.snackBar.open('Completa todos los campos requeridos', 'Cerrar');
      return;
    }

    // Validar que costoCompra no sea mayor que precioVenta
    const costoCompra = parseFloat(this.formularioProductoCompra.get('costoCompra')?.value || 0);
    const precioVenta = parseFloat(this.formularioProductoCompra.get('precioVenta')?.value || 0);
    
    if (costoCompra > precioVenta) {
      this.snackBar.open('Error: El precio de compra no puede ser mayor al precio de venta', 'Cerrar', {
        duration: 4000
      });
      return;
    }

    const formValue = this.formularioProductoCompra.value;
    const proveedorSeleccionado = this.proveedores.find(p => p.idProveedor === parseInt(formValue.idProveedor));

    const detalle: DetalleCompraManual = {
      marcaVehiculo: formValue.marcaVehiculo,
      modeloVehiculo: formValue.modeloVehiculo,
      anioVehiculo: formValue.anioVehiculo.toString(),
      tipoVidrio: formValue.tipoVidrio,
      calidadVidrio: formValue.calidadVidrio,
      idProveedor: parseInt(formValue.idProveedor),
      nombreProveedor: proveedorSeleccionado?.nombreProveedor || '',
      cantidad: parseInt(formValue.cantidad),
      costoCompra: costoCompra,
      precioVenta: precioVenta,
      subtotal: 0,
      ubicacionAlmacen: formValue.ubicacionAlmacen
    };

    detalle.subtotal = detalle.costoCompra * detalle.cantidad;
    this.detallesCompra.push(detalle);
    this.actualizarTotales();

    this.snackBar.open('Producto agregado a la lista', 'Cerrar', { duration: 2000 });
    this.limpiarFormularioProducto();
  }

  eliminarDetalle(index: number): void {
    this.detallesCompra.splice(index, 1);
    this.actualizarTotales();
  }

  limpiarFormularioProducto(): void {
    this.compraFormDir?.resetForm({
      cantidad: '1',
      precioVenta: ''
    });
  }

  actualizarTotales(): void {
    this.totalCosto = this.detallesCompra.reduce((total, item) => total + item.subtotal, 0);
    this.totalVenta = this.detallesCompra.reduce((total, item) => total + (item.precioVenta * item.cantidad), 0);
    this.totalUnidades = this.detallesCompra.reduce((total, item) => total + item.cantidad, 0);
  }

  confirmarCompra(): void {
    if (this.detallesCompra.length === 0) return;

    this.isLoading = true;
    const idUsuario = this.authService.getCurrentUserId();

    if (idUsuario === 0) {
      this.snackBar.open('Error: No se pudo obtener el ID del usuario. Por favor vuelve a iniciar sesión.', 'Cerrar', {
        duration: 6000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.isLoading = false;
      return;
    }

    const detalle: DetalleListCompraDTO[] = this.detallesCompra.map(d => ({
      idDetallaCompra: undefined,
      idProveedor: d.idProveedor,
      idProducto: 0,
      marcaVehiculo: d.marcaVehiculo,
      modeloVehiculo: d.modeloVehiculo,
      anioVehiculo: d.anioVehiculo,
      tipoVidrio: d.tipoVidrio,
      calidadVidrio: d.calidadVidrio,
      costoCompra: d.costoCompra,
      precioVenta: d.precioVenta,
      cantidad: d.cantidad,
      ubicacionAlmacen: d.ubicacionAlmacen
    }));

    const compra: CompraDTO = {
      nombreProveedor: this.detallesCompra[0]?.nombreProveedor || '',
      idUsuario: idUsuario,
      totalCompra: this.totalCosto,
      detalle: detalle
    };

    console.log('Enviando compra al backend:', JSON.stringify(compra, null, 2));

    this.compraService.crearCompra(compra).subscribe({
      next: (response) => {
        Promise.resolve().then(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.snackBar.open('Compra registrada correctamente', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.detallesCompra = [];
          this.totalCosto = 0;
          this.totalVenta = 0;
          this.totalUnidades = 0;
          this.formularioProductoCompra.reset();
        });
      },
      error: (error: any) => {
        Promise.resolve().then(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          const mensaje = error?.error?.message || error?.error?.detalle || 'Error desconocido al guardar compra';
          console.error('Error completo:', error);
          console.error('Respuesta:', error?.error);
          this.snackBar.open('Error: ' + mensaje, 'Cerrar', {
            duration: 6000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        });
      }
    });
  }

  buscarCompra(): void {
    const tipoRangoFechas = this.formularioBusquedaCompra.get('tipoRangoFechas')?.value;
    
    this.isLoadingBusquedaCompra = true;
    this.compraEncontrada = null;
    this.compraNoEncontrada = false;
    this.cdr.detectChanges();

    if (tipoRangoFechas === 'idCompra') {
      const idCompra = this.formularioBusquedaCompra.get('idCompra')?.value;
      if (!idCompra) {
        this.snackBar.open('Por favor ingresa un ID de compra', 'Cerrar');
        this.isLoadingBusquedaCompra = false;
        this.cdr.detectChanges();
        return;
      }
      
      this.compraService.buscarPorId(idCompra).subscribe({
        next: (data) => {
          this.compraEncontrada = data;
          this.isLoadingBusquedaCompra = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoadingBusquedaCompra = false;
          this.compraNoEncontrada = true;
          this.cdr.detectChanges();
        }
      });
    } else if (tipoRangoFechas === 'rango') {
      const fechaInicio = this.formularioBusquedaCompra.get('fechaInicio')?.value;
      const fechaFin = this.formularioBusquedaCompra.get('fechaFin')?.value;
      
      if (!fechaInicio || !fechaFin) {
        this.snackBar.open('Por favor completa ambas fechas', 'Cerrar');
        this.isLoadingBusquedaCompra = false;
        this.cdr.detectChanges();
        return;
      }
      
      this.compraService.buscarPorRangoFechas(fechaInicio, fechaFin).subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            this.compraEncontrada = data[0];
          } else {
            this.compraNoEncontrada = true;
          }
          this.isLoadingBusquedaCompra = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoadingBusquedaCompra = false;
          this.compraNoEncontrada = true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  limpiarBusquedaCompra(): void {
    this.formularioBusquedaCompra.reset();
    this.compraEncontrada = null;
    this.compraNoEncontrada = false;
  }

  // TrackBy functions para optimizar *ngFor
  trackByProveedor(index: number, item: ProveedorDTO): number {
    return item.idProveedor || index;
  }

  trackByDetalle(index: number, item: DetalleCompraManual): number {
    return index;
  }

  trackByDetalleBusqueda(index: number, item: DetalleListCompraDTO): number {
    return index;
  }

  trackByCompra(index: number, item: CompraDTO): number {
    return item.idCompra || index;
  }

  toggleExpandCompra(compraId: number): void {
    this.expandedCompraId = this.expandedCompraId === compraId ? null : compraId;
  }

  trackByDetalleCompra(index: number, item: any): number {
    return item.idDetalleCompra || index;
  }
}
