import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Ingreso de Inventario (Compras)</h1>

      <mat-tab-group>
        <!-- Pestaña Nueva Compra Manual -->
        <mat-tab label="Nueva Compra">
          <div class="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <!-- Panel de formulario de producto -->
            <div class="md:col-span-3">
              <div class="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
                <h2 class="text-lg md:text-xl font-semibold mb-4">Registrar Producto y Compra Manual</h2>

                <form [formGroup]="formularioProductoCompra" (ngSubmit)="agregarDetalleALista()" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Fila 1: Marca y Modelo -->
                  <mat-form-field class="w-full">
                    <mat-label>Marca Vehículo</mat-label>
                    <input matInput formControlName="marcaVehiculo" placeholder="Ej: Chevrolet" />
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Modelo Vehículo</mat-label>
                    <input matInput formControlName="modeloVehiculo" placeholder="Ej: Aveo" />
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Año</mat-label>
                    <input matInput type="number" formControlName="anioVehiculo" placeholder="2020" min="1990" max="2050" />
                  </mat-form-field>

                  <!-- Fila 2: Posición y Tipo de Vidrio -->
                  <mat-form-field class="w-full">
                    <mat-label>Posición Vidrio</mat-label>
                    <mat-select formControlName="tipoVidrio">
                      <mat-option value="">Seleccionar</mat-option>
                      <mat-option value="Delantero">Delantero</mat-option>
                      <mat-option value="Posterior">Posterior</mat-option>
                      <mat-option value="Puerta">Puerta</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Tipo Vidrio</mat-label>
                    <mat-select formControlName="calidadVidrio">
                      <mat-option value="">Seleccionar</mat-option>
                      <mat-option value="Templado">Templado</mat-option>
                      <mat-option value="Laminado">Laminado</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <!-- Fila 3: Proveedor -->
                  <mat-form-field class="w-full">
                    <mat-label>Proveedor</mat-label>
                    <mat-select formControlName="idProveedor">
                      <mat-option value="">-- Seleccionar Proveedor --</mat-option>
                      <mat-option *ngFor="let prov of proveedores; trackBy: trackByProveedor" [value]="prov.idProveedor">
                        {{ prov.nombreProveedor }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <!-- Fila 4: Cantidad y Precios -->
                  <mat-form-field class="w-full">
                    <mat-label>Cantidad</mat-label>
                    <input matInput type="number" formControlName="cantidad" placeholder="1" min="1" />
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Costo Compra (S/)</mat-label>
                    <input matInput type="number" formControlName="costoCompra" placeholder="0.00" min="0.01" step="0.01" />
                  </mat-form-field>

                  <mat-form-field class="w-full">
                    <mat-label>Precio Venta (S/)</mat-label>
                    <input matInput type="number" formControlName="precioVenta" placeholder="0.00" min="0" step="0.01" />
                  </mat-form-field>

                  <mat-form-field class="w-full col-span-1 md:col-span-3">
                    <mat-label>Ubicación Almacén *</mat-label>
                    <input matInput formControlName="ubicacionAlmacen" placeholder="Ej: Almacén A, Estante 5" />
                  </mat-form-field>

                  <div class="col-span-1 md:col-span-3 flex flex-col md:flex-row gap-2">
                    <button mat-raised-button color="accent" type="submit" [disabled]="!formularioProductoCompra.valid" class="flex-1">
                      Agregar a Lista
                    </button>
                    <button mat-raised-button type="button" (click)="limpiarFormularioProducto()" class="flex-1">
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              <!-- Lista de detalles de compra -->
              <div class="bg-white rounded-lg shadow p-4 md:p-6">
                <h2 class="text-lg md:text-xl font-semibold mb-4">
                  Detalles de Compra ({{ detallesCompra.length }})
                </h2>

                <div *ngIf="detallesCompra.length > 0" class="overflow-x-auto">
                  <table class="w-full border-collapse text-xs md:text-sm">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="border p-2 md:p-3 text-left">Marca</th>
                        <th class="border p-2 md:p-3 text-left">Modelo</th>
                        <th class="border p-2 md:p-3 text-left">Año</th>
                        <th class="border p-2 md:p-3 text-left">Tipo</th>
                        <th class="border p-2 md:p-3 text-left">Calidad</th>
                        <th class="border p-2 md:p-3 text-left">Ubicación</th>
                        <th class="border p-2 md:p-3 text-center">Cant.</th>
                        <th class="border p-2 md:p-3 text-right">Costo</th>
                        <th class="border p-2 md:p-3 text-right">P. Vta</th>
                        <th class="border p-2 md:p-3 text-right">Subtotal</th>
                        <th class="border p-2 md:p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let detalle of detallesCompra; let i = index; trackBy: trackByDetalle" class="hover:bg-gray-50 border-b">
                        <td class="border p-2 md:p-3">{{ detalle.marcaVehiculo }}</td>
                        <td class="border p-2 md:p-3">{{ detalle.modeloVehiculo }}</td>
                        <td class="border p-2 md:p-3">{{ detalle.anioVehiculo }}</td>
                        <td class="border p-2 md:p-3">{{ detalle.tipoVidrio }}</td>
                        <td class="border p-2 md:p-3">{{ detalle.calidadVidrio }}</td>
                        <td class="border p-2 md:p-3 text-xs font-semibold">{{ detalle.ubicacionAlmacen }}</td>
                        <td class="border p-2 md:p-3 text-center font-semibold">{{ detalle.cantidad }}</td>
                        <td class="border p-2 md:p-3 text-right">{{ detalle.costoCompra | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-2 md:p-3 text-right">{{ detalle.precioVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-2 md:p-3 text-right font-bold text-sblue-500">{{ detalle.subtotal | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-2 md:p-3 text-center">
                          <button mat-raised-button color="warn" (click)="eliminarDetalle(i)" size="small">
                            <span class="hidden md:inline">Eliminar</span>
                            <mat-icon class="md:hidden">delete</mat-icon>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="detallesCompra.length === 0" class="p-8 text-center text-gray-500 text-sm md:text-base">
                  No hay productos agregados. Completa el formulario y presiona "Agregar a Lista"
                </div>
              </div>
            </div>

            <!-- Panel resumen compra -->
            <div class="md:col-span-1">
              <mat-card class="md:sticky md:top-6">
                <mat-card-header>
                  <mat-card-title class="text-lg md:text-xl">Resumen de Compra</mat-card-title>
                </mat-card-header>

                <mat-card-content class="text-sm md:text-base">
                  <div class="border-t border-b py-4 my-4 space-y-2">
                    <div class="flex justify-between">
                      <span>Productos:</span>
                      <strong>{{ detallesCompra.length }}</strong>
                    </div>
                    <div class="flex justify-between">
                      <span>Total Unidades:</span>
                      <strong>{{ totalUnidades }}</strong>
                    </div>
                    <div class="text-lg md:text-xl font-bold text-sblue-500 flex justify-between py-2">
                      <span>Total Costo:</span>
                      <span>{{ totalCosto | currency : 'PEN' : 'S/' }}</span>
                    </div>
                    <div class="text-base md:text-lg font-semibold text-semerald-500 flex justify-between">
                      <span>Total Venta:</span>
                      <span>{{ totalVenta | currency : 'PEN' : 'S/' }}</span>
                    </div>
                  </div>

                  <button
                    mat-raised-button
                    color="primary"
                    (click)="confirmarCompra()"
                    [disabled]="detallesCompra.length === 0 || isLoading"
                    class="w-full py-2 md:py-3 text-base md:text-lg font-semibold mt-4"
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
            <div class="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
              <h2 class="text-lg md:text-xl font-semibold mb-4">Buscar Compra</h2>

              <form [formGroup]="formularioBusquedaCompra" (ngSubmit)="buscarCompra()" class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
                <mat-form-field class="col-span-2 md:col-span-1 w-full">
                  <mat-label>Tipo de Búsqueda</mat-label>
                  <mat-select formControlName="tipoRangoFechas">
                    <mat-option value="idCompra">Por ID</mat-option>
                    <mat-option value="rango">Por Rango de Fechas</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Búsqueda por ID -->
                <mat-form-field *ngIf="formularioBusquedaCompra.get('tipoRangoFechas')?.value === 'idCompra'" class="col-span-2 md:col-span-1 w-full">
                  <mat-label>ID Compra</mat-label>
                  <input matInput type="number" formControlName="idCompra" placeholder="1" />
                </mat-form-field>

                <!-- Búsqueda por Rango de Fechas -->
                <ng-container *ngIf="formularioBusquedaCompra.get('tipoRangoFechas')?.value === 'rango'">
                  <mat-form-field class="col-span-1 md:col-span-1 w-full">
                    <mat-label>Fecha Inicio</mat-label>
                    <input matInput type="date" formControlName="fechaInicio" />
                  </mat-form-field>
                  <mat-form-field class="col-span-1 md:col-span-1 w-full">
                    <mat-label>Fecha Fin</mat-label>
                    <input matInput type="date" formControlName="fechaFin" />
                  </mat-form-field>
                </ng-container>

                <button mat-raised-button color="primary" type="submit" class="col-span-1">Buscar</button>
                <button mat-raised-button type="button" (click)="limpiarBusquedaCompra()" class="col-span-1">Limpiar</button>
              </form>

              <div *ngIf="isLoadingBusquedaCompra" class="flex justify-center mb-6">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <!-- Resultado búsqueda -->
              <div *ngIf="compraEncontrada" class="bg-gray-50 rounded-lg p-4 md:p-6">
                <h3 class="font-bold text-lg mb-4">Compra #{{ compraEncontrada.idCompra }}</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p class="text-gray-600 text-sm">Proveedor:</p>
                    <p class="font-semibold">{{ compraEncontrada.nombreProveedor }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600 text-sm">Fecha:</p>
                    <p class="font-semibold">{{ compraEncontrada.fechaCompra | date : 'short' }}</p>
                  </div>
                  <div class="col-span-1 md:col-span-2">
                    <p class="text-gray-600 text-sm">Total:</p>
                    <p class="font-bold text-sblue-500 text-lg">{{ compraEncontrada.totalCompra | currency : 'PEN' : 'S/' }}</p>
                  </div>
                </div>

                <h4 class="font-semibold mb-3 text-sm md:text-base">Productos:</h4>
                <div class="overflow-x-auto">
                  <table class="w-full border-collapse text-xs md:text-sm">
                    <thead>
                      <tr class="bg-gray-200">
                        <th class="border p-2 text-left">Marca</th>
                        <th class="border p-2 text-left">Modelo</th>
                        <th class="border p-2 text-left">Año</th>
                        <th class="border p-2 text-left">Ubicación</th>
                        <th class="border p-2 text-center">Cantidad</th>
                        <th class="border p-2 text-right">Costo</th>
                        <th class="border p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of compraEncontrada.detalle; trackBy: trackByDetalleBusqueda" class="border-b">
                        <td class="border p-2">{{ item.marcaVehiculo || 'N/A' }}</td>
                        <td class="border p-2">{{ item.modeloVehiculo || 'N/A' }}</td>
                        <td class="border p-2">{{ item.anioVehiculo || 'N/A' }}</td>
                        <td class="border p-2 text-xs font-semibold">{{ item.ubicacionAlmacen || 'N/A' }}</td>
                        <td class="border p-2 text-center">{{ item.cantidad }}</td>
                        <td class="border p-2 text-right">{{ item.costoCompra | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-2 text-right font-semibold">{{ (item.costoCompra * item.cantidad) | currency : 'PEN' : 'S/' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div *ngIf="compraNoEncontrada" class="p-4 md:p-6 text-center text-srose-500 bg-srose-50 rounded-lg text-sm md:text-base">
                No se encontró compra con ese ID
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Pestaña Historial de Compras -->
        <mat-tab label="Historial de Compras">
          <div class="mt-4 md:mt-6">
            <div class="bg-white rounded-lg shadow p-4 md:p-6">
              <h2 class="text-lg md:text-xl font-semibold mb-4">Historial de Compras</h2>

              <div *ngIf="isLoadingHistorial" class="flex justify-center py-12">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="!isLoadingHistorial && historialCompras.length > 0" class="overflow-x-auto">
                <table class="w-full border-collapse text-xs md:text-sm">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border p-2 md:p-3 text-center" style="width: 40px;"></th>
                      <th class="border p-2 md:p-3 text-left">Proveedor</th>
                      <th class="border p-2 md:p-3 text-right">Total (S/)</th>
                      <th class="border p-2 md:p-3 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ng-container *ngFor="let compra of historialCompras; trackBy: trackByCompra">
                      <!-- Fila Resumen -->
                      <tr class="hover:bg-gray-50 border-b cursor-pointer" (click)="toggleExpandCompra(compra.idCompra || 0)">
                        <td class="border p-2 md:p-3 text-center">
                          <mat-icon class="text-gray-600 text-sm md:text-base" [ngClass]="{'rotate-90': expandedCompraId === compra.idCompra}">arrow_right</mat-icon>
                        </td>
                        <td class="border p-2 md:p-3 font-semibold text-sm md:text-base">{{ compra.nombreProveedor }}</td>
                        <td class="border p-2 md:p-3 text-right font-bold text-sblue-500 text-sm md:text-base">{{ compra.totalCompra | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-2 md:p-3 text-sm md:text-base">{{ compra.fechaCompra | date : 'short' }}</td>
                      </tr>
                      <!-- Filas Detalles (Expandidas) -->
                      <ng-container *ngIf="expandedCompraId === compra.idCompra && compra.detalle && compra.detalle.length > 0">
                        <tr *ngFor="let detalle of compra.detalle; trackBy: trackByDetalleCompra" class="bg-sblue-50 border-b">
                          <td class="border p-2"></td>
                          <td class="border p-2 text-xs md:text-sm">
                            <span class="font-semibold">{{ detalle.marcaVehiculo }} {{ detalle.modeloVehiculo }}</span>
                            <br/>
                            <span class="text-gray-600 text-xs">{{ detalle.tipoVidrio }} • {{ detalle.calidadVidrio }} • {{ detalle.ubicacionAlmacen }}</span>
                          </td>
                          <td class="border p-2 text-right">
                            <div class="text-xs md:text-sm">Cant: {{ detalle.cantidad }}</div>
                            <div class="font-semibold text-sblue-500 text-xs md:text-sm">{{ (detalle.costoCompra * detalle.cantidad) | currency : 'PEN' : 'S/' }}</div>
                          </td>
                          <td class="border p-2"></td>
                        </tr>
                      </ng-container>
                    </ng-container>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!isLoadingHistorial && historialCompras.length === 0" class="p-8 text-center text-gray-500 text-sm md:text-base">
                No hay compras registradas en el sistema
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
  `]
})
export class ComprasComponent implements OnInit {
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
    this.formularioProductoCompra.reset({
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

    // Obtener la fecha actual en formato YYYY-MM-DD
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];

    const compra: CompraDTO = {
      nombreProveedor: this.detallesCompra[0]?.nombreProveedor || '',
      idUsuario: idUsuario,
      fechaCompra: fechaHoy,
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
