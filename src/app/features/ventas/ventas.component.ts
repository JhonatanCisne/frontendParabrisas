import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
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
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Punto de Venta</h1>

      <mat-tab-group>
        <!-- Pestaña Nueva Venta -->
        <mat-tab label="Nueva Venta">
          <div class="mt-6 grid grid-cols-4 gap-6">
            <!-- Panel de formulario -->
            <div class="col-span-3">
              <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h2 class="text-xl font-semibold mb-4">Registrar Venta</h2>

                <form [formGroup]="formularioVenta" (ngSubmit)="agregarDetalleALista()" class="grid grid-cols-4 gap-4">
                  <!-- Fila 1: ID Producto y Seleccionar de lista -->
                  <mat-form-field>
                    <mat-label>ID Producto</mat-label>
                    <input matInput type="number" formControlName="idProducto" placeholder="ej: 1" />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Producto disponible</mat-label>
                    <mat-select formControlName="productoSeleccionado" (selectionChange)="onProductoSeleccionado($event)">
                      <mat-option value="">Seleccionar...</mat-option>
                      <mat-option *ngFor="let prod of productosDisponibles; trackBy: trackByProducto" [value]="prod.idProducto">
                        {{ prod.marcaVehiculo }} {{ prod.modeloVehiculo }} (S/ {{ prod.precioVenta | currency }})
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <!-- Fila 2: Cantidad y Placa -->
                  <mat-form-field>
                    <mat-label>Cantidad</mat-label>
                    <input matInput type="number" formControlName="cantidad" placeholder="1" min="1" />
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Placa Vehículo</mat-label>
                    <input matInput formControlName="placaVehiculo" placeholder="ABC-1234" />
                  </mat-form-field>

                  <!-- Botón agregar -->
                  <div class="col-span-4 flex gap-2">
                    <button mat-raised-button color="accent" type="submit" [disabled]="!formularioVenta.valid">
                      Agregar a Lista
                    </button>
                    <button mat-raised-button type="button" (click)="limpiarFormularioVenta()">
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              <!-- Lista de detalles de venta -->
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-semibold mb-4">
                  Detalles de Venta ({{ detallesVenta.length }})
                </h2>

                <div *ngIf="detallesVenta.length > 0" class="overflow-x-auto">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="border p-3 text-left">Marca</th>
                        <th class="border p-3 text-left">Modelo</th>
                        <th class="border p-3 text-center">ID Prod</th>
                        <th class="border p-3 text-left">Placa</th>
                        <th class="border p-3 text-center">Cant.</th>
                        <th class="border p-3 text-right">Precio Unit.</th>
                        <th class="border p-3 text-right">Subtotal</th>
                        <th class="border p-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let detalle of detallesVenta; let i = index; trackBy: trackByDetalle" class="hover:bg-gray-50 border-b">
                        <td class="border p-3">{{ detalle.marcaVehiculo }}</td>
                        <td class="border p-3">{{ detalle.modeloVehiculo }}</td>
                        <td class="border p-3 text-center font-semibold">{{ detalle.idProducto }}</td>
                        <td class="border p-3">{{ detalle.placaVehiculo }}</td>
                        <td class="border p-3 text-center font-semibold">{{ detalle.cantidad }}</td>
                        <td class="border p-3 text-right">{{ detalle.precioVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-3 text-right font-bold text-semerald-500">{{ detalle.subtotal | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-3 text-center">
                          <button mat-raised-button color="warn" (click)="eliminarDetalle(i)" size="small">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="detallesVenta.length === 0" class="p-8 text-center text-gray-500">
                  No hay ventas agregadas. Completa el formulario y presiona "Agregar a Lista"
                </div>
              </div>
            </div>

            <!-- Panel resumen venta -->
            <div class="col-span-1">
              <mat-card class="sticky top-6">
                <mat-card-header>
                  <mat-card-title>Resumen de Venta</mat-card-title>
                </mat-card-header>

                <mat-card-content>
                  <div class="border-t border-b py-4 my-4 space-y-2">
                    <div class="flex justify-between">
                      <span>Productos:</span>
                      <strong>{{ detallesVenta.length }}</strong>
                    </div>
                    <div class="flex justify-between">
                      <span>Total Unidades:</span>
                      <strong>{{ totalUnidades }}</strong>
                    </div>
                    <div class="text-xl font-bold text-semerald-500 flex justify-between py-2">
                      <span>Total Venta:</span>
                      <span>{{ totalVenta | currency : 'PEN' : 'S/' }}</span>
                    </div>
                  </div>

                  <button
                    mat-raised-button
                    color="primary"
                    (click)="confirmarVenta()"
                    [disabled]="detallesVenta.length === 0 || isLoading"
                    class="w-full py-3 text-lg font-semibold"
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
          <div class="mt-6">
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h2 class="text-xl font-semibold mb-4">Buscar Venta</h2>

              <form [formGroup]="formularioBusquedaVenta" (ngSubmit)="buscarVenta()" class="grid grid-cols-4 gap-4 mb-6">
                <mat-form-field>
                  <mat-label>Tipo de Búsqueda</mat-label>
                  <mat-select formControlName="tipoBusqueda">
                    <mat-option value="placa">Por Placa</mat-option>
                    <mat-option value="rango">Por Rango de Fechas</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Búsqueda por Placa -->
                <mat-form-field *ngIf="formularioBusquedaVenta.get('tipoBusqueda')?.value === 'placa'">
                  <mat-label>Placa del Vehículo</mat-label>
                  <input matInput formControlName="placa" placeholder="ABC-1234" />
                </mat-form-field>

                <!-- Búsqueda por Rango de Fechas -->
                <ng-container *ngIf="formularioBusquedaVenta.get('tipoBusqueda')?.value === 'rango'">
                  <mat-form-field>
                    <mat-label>Fecha Inicio</mat-label>
                    <input matInput type="date" formControlName="fechaInicio" />
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Fecha Fin</mat-label>
                    <input matInput type="date" formControlName="fechaFin" />
                  </mat-form-field>
                </ng-container>

                <button mat-raised-button color="primary" type="submit">Buscar</button>
                <button mat-raised-button type="button" (click)="limpiarBusquedaVenta()">Limpiar</button>
              </form>

              <div *ngIf="isLoadingBusqueda" class="flex justify-center mb-6">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <!-- Resultado búsqueda -->
              <div *ngIf="detallesEncontrados.length > 0" class="bg-gray-50 rounded-lg p-6">
                <h3 class="font-bold text-lg mb-4">Detalles Encontrados ({{ detallesEncontrados.length }})</h3>

                <div class="overflow-x-auto">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="bg-gray-200">
                        <th class="border p-2 text-left">Placa</th>
                        <th class="border p-2 text-left">Marca</th>
                        <th class="border p-2 text-left">Modelo</th>
                        <th class="border p-2 text-center">Cantidad</th>
                        <th class="border p-2 text-right">Precio</th>
                        <th class="border p-2 text-right">Subtotal</th>
                        <th class="border p-2 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let detalle of detallesEncontrados; trackBy: trackByDetalleEncontrado" class="border-b">
                        <td class="border p-2 font-semibold">{{ detalle.placaVehiculo || 'N/A' }}</td>
                        <td class="border p-2">{{ detalle.marcaVehiculo || 'N/A' }}</td>
                        <td class="border p-2">{{ detalle.modeloVehiculo || 'N/A' }}</td>
                        <td class="border p-2 text-center">{{ detalle.cantidad }}</td>
                        <td class="border p-2 text-right">{{ detalle.precioVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-2 text-right font-semibold">{{ detalle.subtotal | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-2 text-left">{{ detalle.fecha | date : 'short' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div *ngIf="ventaNoEncontrada && !isLoadingBusqueda" class="p-6 text-center text-srose-500 bg-srose-50 rounded-lg">
                No se encontraron ventas con los criterios especificados
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Pestaña Historial de Ventas -->
        <mat-tab label="Historial de Ventas">
          <div class="mt-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold mb-4">Historial de Ventas</h2>

              <div *ngIf="isLoadingHistorial" class="flex justify-center py-12">
                <mat-spinner diameter="40"></mat-spinner>
              </div>

              <div *ngIf="!isLoadingHistorial && historialsVentas.length > 0" class="overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border p-3 text-center">ID Venta</th>
                      <th class="border p-3 text-left">Placa</th>
                      <th class="border p-3 text-right">Monto Total (S/)</th>
                      <th class="border p-3 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ng-container *ngFor="let venta of historialsVentas; trackBy: trackByVentaHistorial">
                      <!-- Fila Resumen -->
                      <tr class="hover:bg-gray-50 border-b cursor-pointer" (click)="toggleExpandVenta(venta.idVenta || 0)">
                        <td class="border p-3 text-center font-semibold">{{ venta.idVenta }}</td>
                        <td class="border p-3 font-semibold">{{ venta.placaVehiculo || venta.detalles?.[0]?.placaVehiculo || 'N/A' }}</td>
                        <td class="border p-3 text-right font-bold text-semerald-500">{{ venta.totalVenta | currency : 'PEN' : 'S/' }}</td>
                        <td class="border p-3">{{ venta.fecha | date : 'short' }}</td>
                      </tr>
                      <!-- Filas Detalles (Expandidas) -->
                      <ng-container *ngIf="expandedVentaId === venta.idVenta && venta.detalles && venta.detalles.length > 0">
                        <tr *ngFor="let detalle of venta.detalles; trackBy: trackByDetalleVenta" class="bg-semerald-50 border-b">
                          <td class="border p-2 text-sm">
                            <span class="font-semibold">{{ detalle.marcaVehiculo }} {{ detalle.modeloVehiculo }}</span>
                            <br/>
                            <span class="text-gray-600 text-xs">{{ detalle.tipoVidrio }} • {{ detalle.calidadVidrio }}</span>
                          </td>
                          <td class="border p-2 text-sm">{{ detalle.placaVehiculo }}</td>
                          <td class="border p-2 text-right">
                            <div class="text-sm">Cant: {{ detalle.cantidad }}</div>
                            <div class="font-semibold text-semerald-500">{{ (detalle.precioVenta * detalle.cantidad) | currency : 'PEN' : 'S/' }}</div>
                          </td>
                          <td class="border p-2"></td>
                        </tr>
                      </ng-container>
                    </ng-container>
                  </tbody>
                </table>
              </div>

              <div *ngIf="!isLoadingHistorial && historialsVentas.length === 0" class="p-8 text-center text-gray-500">
                No hay ventas registradas en el sistema
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: []
})
export class VentasComponent implements OnInit {
  formularioVenta: FormGroup;
  formularioBusquedaVenta: FormGroup;

  detallesVenta: DetalleVentaManual[] = [];
  productosDisponibles: ProductListDTO[] = [];
  ventasEncontradas: any[] = [];
  detallesEncontrados: any[] = [];
  ventaNoEncontrada = false;
  historialsVentas: VentaDTO[] = [];
  detallesHistorialVentas: any[] = [];

  totalVenta = 0;
  totalUnidades = 0;
  isLoading = false;
  isLoadingBusqueda = false;
  isLoadingHistorial = false;
  expandedVentaId: number | null = null;

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.formularioVenta = this.fb.group({
      idProducto: ['', [Validators.required, Validators.min(1)]],
      productoSeleccionado: [''],
      cantidad: ['1', [Validators.required, Validators.min(1)]],
      placaVehiculo: ['', [Validators.required]]
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
    this.productoService.getCatalogo().subscribe({
      next: (data: ProductListDTO[]) => {
        this.productosDisponibles = data;
      },
      error: (error: any) => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar productos', 'Cerrar');
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

  onProductoSeleccionado(event: any): void {
    const idProducto = event.value;
    if (idProducto) {
      this.formularioVenta.patchValue({
        idProducto: idProducto
      });
    }
  }

  agregarDetalleALista(): void {
    if (!this.formularioVenta.valid) {
      this.snackBar.open('Completa todos los campos requeridos', 'Cerrar');
      return;
    }

    const idProducto = parseInt(this.formularioVenta.get('idProducto')?.value || 0);
    const producto = this.productosDisponibles.find(p => p.idProducto === idProducto);

    if (!producto) {
      this.snackBar.open('Producto no encontrado', 'Cerrar');
      return;
    }

    const formValue = this.formularioVenta.value;
    const detalle: DetalleVentaManual = {
      idProducto: idProducto,
      marcaVehiculo: producto.marcaVehiculo,
      modeloVehiculo: producto.modeloVehiculo,
      anioVehiculo: producto.anioVehiculo,
      tipoVidrio: producto.tipoVidrio,
      calidadVidrio: producto.calidadVidrio,
      placaVehiculo: formValue.placaVehiculo,
      cantidad: parseInt(formValue.cantidad),
      precioVenta: producto.precioVenta,
      subtotal: 0
    };

    detalle.subtotal = detalle.precioVenta * detalle.cantidad;
    this.detallesVenta.push(detalle);
    this.actualizarTotales();

    this.snackBar.open('Producto agregado a la lista', 'Cerrar', { duration: 2000 });
    this.limpiarFormularioVenta();
  }

  eliminarDetalle(index: number): void {
    this.detallesVenta.splice(index, 1);
    this.actualizarTotales();
  }

  limpiarFormularioVenta(): void {
    this.formularioVenta.reset({
      cantidad: '1',
      idProducto: '',
      productoSeleccionado: '',
      placaVehiculo: ''
    });
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

    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];

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
      fecha: fechaHoy,
      totalVenta: this.totalVenta,
      detalles: detalles,
      placaVehiculo: placaPrincipal
    };

    console.log('Enviando venta al backend:', JSON.stringify(venta, null, 2));

    this.ventaService.crearVenta(venta).subscribe({
      next: (response) => {
        this.snackBar.open('Venta registrada correctamente', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.detallesVenta = [];
        this.totalVenta = 0;
        this.totalUnidades = 0;
        this.formularioVenta.reset({ cantidad: '1' });
        setTimeout(() => {
          this.isLoading = false;
        }, 0);
      },
      error: (error: any) => {
        const mensaje = error?.error?.message || error?.error?.detalle || 'Error desconocido al guardar venta';
        console.error('Error completo:', error);
        console.error('Respuesta:', error?.error);
        this.snackBar.open('Error: ' + mensaje, 'Cerrar', {
          duration: 6000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        setTimeout(() => {
          this.isLoading = false;
        }, 0);
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
