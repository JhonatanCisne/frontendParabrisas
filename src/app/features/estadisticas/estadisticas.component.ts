import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VentaService } from '../ventas/services/venta.service';
import { ProductoService } from '../productos/services/producto.service';
import { EstadisticasDTO, ProductoBajoStockDTO, VentasPorMesDTO, VentasPorProductoDTO } from '../../shared/models';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  styleUrls: ['./estadisticas.component.css'],
  template: `
    <div class="container mx-auto p-4 md:p-6 estadisticas-container">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Estadísticas del Sistema</h1>

      <!-- Tarjetas de Estadísticas -->
      <div class="estadisticas-grid">
        <!-- Vidrio Más Vendido -->
        <mat-card>
          <mat-card-content class="p-6">
            <div class="flex items-center justify-center mb-6">
              <mat-icon class="text-5xl text-sblue-500" style="font-size: 48px; height: 48px; width: 48px">
                trending_up
              </mat-icon>
            </div>
            <h3 class="text-base font-semibold text-gray-600 text-center mb-4">Vidrio Más Vendido</h3>
            <div class="space-y-2 text-sm">
              <ng-container *ngIf="estadisticas?.vidrioMasVendido as vidrio">
                <p class="text-gray-500">Marca: <span class="font-bold text-gray-800 block">{{ vidrio.marcaVehiculo }}</span></p>
                <p class="text-gray-500 mt-2">Modelo: <span class="font-bold text-gray-800 block">{{ vidrio.modeloVehiculo }}</span></p>
                <p class="text-gray-500 mt-2">Año: <span class="font-bold text-gray-800 block">{{ vidrio.anioVehiculo }}</span></p>
                <p class="text-gray-500 mt-2">Tipo: <span class="font-bold text-gray-800 block">{{ vidrio.tipoVidrio }}</span></p>
              </ng-container>
              <div *ngIf="!estadisticas?.vidrioMasVendido" class="text-center">
                <p class="text-xl font-bold text-gray-800">N/A</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Total Vidrios Vendidos -->
        <mat-card>
          <mat-card-content class="p-6 flex flex-col h-full justify-center">
            <div class="flex items-center justify-center mb-4">
              <mat-icon class="text-5xl text-semerald-500" style="font-size: 48px; height: 48px; width: 48px">
                sell
              </mat-icon>
            </div>
            <h3 class="text-base font-semibold text-gray-600 text-center mb-3">Total Vendidos</h3>
            <p class="text-3xl font-bold text-gray-800 text-center">
              {{ estadisticas?.totalVidriosVendidos || 0 }}
            </p>
          </mat-card-content>
        </mat-card>

        <!-- Total en Stock -->
        <mat-card>
          <mat-card-content class="p-6 flex flex-col h-full justify-center">
            <div class="flex items-center justify-center mb-4">
              <mat-icon class="text-5xl text-sblue-500" style="font-size: 48px; height: 48px; width: 48px">
                inventory_2
              </mat-icon>
            </div>
            <h3 class="text-base font-semibold text-gray-600 text-center mb-3">Stock Total</h3>
            <p class="text-3xl font-bold text-gray-800 text-center">
              {{ estadisticas?.totalVidriosEnStock || 0 }}
            </p>
          </mat-card-content>
        </mat-card>

        <!-- Total Ventas General -->
        <mat-card>
          <mat-card-content class="p-6 flex flex-col h-full justify-center">
            <div class="flex items-center justify-center mb-4">
              <mat-icon class="text-5xl text-sblue-500" style="font-size: 48px; height: 48px; width: 48px">
                attach_money
              </mat-icon>
            </div>
            <h3 class="text-base font-semibold text-gray-600 text-center mb-3">Total Ventas</h3>
            <p class="text-3xl font-bold text-gray-800 text-center">
              S/ {{ (estadisticas?.totalGeneralVentas || 0).toFixed(2) }}
            </p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Reporte de Almacén -->
      <div class="reporte-grid">
        <div class="panel-reporte">
          <mat-card>
            <mat-card-header>
              <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <mat-icon>warning</mat-icon>
                Productos con Bajo Stock
              </h2>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="isLoadingProductos" class="cargando">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
              <div *ngIf="!isLoadingProductos && productosBajoStock.length === 0" class="estado-vacio">
                No hay productos con bajo stock
              </div>
              <div *ngIf="!isLoadingProductos && productosBajoStock.length > 0" class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Año</th>
                      <th>Tipo</th>
                      <th>Calidad</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let producto of productosBajoStock">
                      <td>{{ producto.marcaVehiculo }}</td>
                      <td class="text-center">{{ producto.modeloVehiculo }}</td>
                      <td class="text-center">{{ producto.anioVehiculo }}</td>
                      <td class="text-center">{{ producto.tipoVidrio }}</td>
                      <td class="text-center">{{ producto.calidadVidrio }}</td>
                      <td class="text-center">
                        <span class="stock-badge">
                          {{ producto.stockActual }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <div class="acciones-botones">
                <button mat-raised-button color="primary" (click)="descargarPDF()">
                  <mat-icon>picture_as_pdf</mat-icon>
                  Descargar Reporte PDF
                </button>
                <button mat-raised-button color="accent" (click)="copiarReporte()">
                  <mat-icon>content_copy</mat-icon>
                  Copiar Reporte
                </button>
              </div>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- Gráfico de Ventas por Mes -->
      <div class="panel-grafico">
        <mat-card>
          <mat-card-header>
            <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <mat-icon>bar_chart</mat-icon>
              Ventas por Mes
            </h2>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="filtroMesAnoForm" class="form-filtros">
              <mat-form-field class="w-full">
                <mat-label>Mes Inicio</mat-label>
                <select matNativeControl formControlName="mesInicio">
                  <option value="01">Enero</option>
                  <option value="02">Febrero</option>
                  <option value="03">Marzo</option>
                  <option value="04">Abril</option>
                  <option value="05">Mayo</option>
                  <option value="06">Junio</option>
                  <option value="07">Julio</option>
                  <option value="08">Agosto</option>
                  <option value="09">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label>Mes Fin</mat-label>
                <select matNativeControl formControlName="mesFin">
                  <option value="01">Enero</option>
                  <option value="02">Febrero</option>
                  <option value="03">Marzo</option>
                  <option value="04">Abril</option>
                  <option value="05">Mayo</option>
                  <option value="06">Junio</option>
                  <option value="07">Julio</option>
                  <option value="08">Agosto</option>
                  <option value="09">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </mat-form-field>
              <mat-form-field class="w-full">
                <mat-label>Año</mat-label>
                <input matInput type="number" formControlName="ano" min="2020" [max]="currentYear" />
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="cargarVentasPorMes()">
                Filtrar
              </button>
            </form>

            <div *ngIf="isLoadingGrafico" class="cargando">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div *ngIf="!isLoadingGrafico" class="chart-container">
              <canvas #graficoVentas></canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-mdc-card {
        margin: 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .mat-mdc-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: box-shadow 0.3s ease;
      }
      .mat-mdc-card-header {
        margin: 0;
        border-radius: 12px 12px 0 0;
      }
      .mat-mdc-card-content {
        padding: 20px;
      }
      .mat-mdc-card-actions {
        padding: 16px;
      }
    }
  `]
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  estadisticas: EstadisticasDTO | null = null;
  productosBajoStock: ProductoBajoStockDTO[] = [];
  ventasPorMes: VentasPorMesDTO[] = [];
  ultimaActualizacion: Date = new Date();
  isLoading = false;
  isLoadingProductos = false;
  isLoadingGrafico = false;
  filtroMesAnoForm: FormGroup;
  currentYear: number = new Date().getFullYear();

  @ViewChild('graficoVentas') graficoRef!: ElementRef;
  private chart: Chart | null = null;

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    const anoActual = new Date().getFullYear();

    this.filtroMesAnoForm = this.fb.group({
      mesInicio: ['01', Validators.required],
      mesFin: ['05', Validators.required],
      ano: [anoActual, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Cargar gráfico automáticamente con los datos del último año
    setTimeout(() => {
      this.cargarVentasPorMes();
    }, 500);
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.ventaService.obtenerEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.ultimaActualizacion = new Date();
        this.isLoading = false;
        this.cdr.markForCheck();
        
        // Cargar datos adicionales después de que las estadísticas estén listas
        this.cargarProductosBajoStock();
        this.cargarVidrioMasVendido();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  cargarVidrioMasVendido(): void {
    this.ventaService.obtenerVentasPorProducto().subscribe({
      next: (ventasPorProducto) => {
        if (ventasPorProducto && ventasPorProducto.length > 0) {
          // Encontrar el producto con más ventas
          const vidrioMasVendidoData = ventasPorProducto.reduce((max, actual) => {
            return actual.cantidad > max.cantidad ? actual : max;
          });
          
          if (this.estadisticas) {
            this.estadisticas.vidrioMasVendido = {
              marcaVehiculo: vidrioMasVendidoData.marcaVehiculo,
              modeloVehiculo: vidrioMasVendidoData.modeloVehiculo,
              anioVehiculo: vidrioMasVendidoData.anioVehiculo,
              tipoVidrio: vidrioMasVendidoData.tipoVidrio,
              calidadVidrio: vidrioMasVendidoData.calidadVidrio
            };
            this.cdr.markForCheck();
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar vidrio más vendido:', err);
        this.cdr.markForCheck();
      }
    });
  }

  cargarProductosBajoStock(): void {
    this.isLoadingProductos = true;
    this.productoService.obtenerProductosBajoStock().subscribe({
      next: (data) => {
        this.productosBajoStock = this.agruparProductosBajoStock(data);
        this.isLoadingProductos = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoadingProductos = false;
        this.cdr.markForCheck();
      }
    });
  }

  private agruparProductosBajoStock(productos: ProductoBajoStockDTO[]): ProductoBajoStockDTO[] {
    const mapa = new Map<string, ProductoBajoStockDTO>();
    
    productos.forEach(producto => {
      // Crear clave única basada en marca, modelo, tipo, calidad y año
      const clave = `${producto.marcaVehiculo}_${producto.modeloVehiculo}_${producto.tipoVidrio}_${producto.calidadVidrio}_${producto.anioVehiculo}`;
      
      if (mapa.has(clave)) {
        // Si ya existe, sumar el stock
        const existente = mapa.get(clave)!;
        existente.stockActual += producto.stockActual;
      } else {
        // Si no existe, crear nuevo registro
        mapa.set(clave, { ...producto });
      }
    });
    
    return Array.from(mapa.values());
  }

  cargarVentasPorMes(): void {
    if (this.filtroMesAnoForm.invalid) return;

    this.isLoadingGrafico = true;
    const { mesInicio, mesFin, ano } = this.filtroMesAnoForm.value;

    this.ventaService.obtenerVentasPorMesRango(mesInicio, mesFin, ano).subscribe({
      next: (data) => {
        this.ventasPorMes = data;
        // Esperar a que el DOM se actualice antes de renderizar
        setTimeout(() => {
          this.crearGrafico();
          this.isLoadingGrafico = false;
          this.cdr.markForCheck();
        }, 100);
      },
      error: (err) => {
        console.error('Error al cargar ventas por mes:', err);
        this.isLoadingGrafico = false;
        this.cdr.markForCheck();
      }
    });
  }

  crearGrafico(): void {
    if (!this.graficoRef || !this.graficoRef.nativeElement) {
      console.warn('Referencia del gráfico aún no disponible');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.ventasPorMes.map(v => v.mes);
    const cantidades = this.ventasPorMes.map(v => v.cantidad);
    const totales = this.ventasPorMes.map(v => v.totalVentas);

    const ctx = this.graficoRef.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cantidad de Unidades',
            data: cantidades,
            backgroundColor: 'rgba(111, 143, 226, 0.7)',
            borderColor: 'rgb(111, 143, 226)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Total en Soles',
            data: totales,
            backgroundColor: 'rgba(107, 90, 179, 0.4)',
            borderColor: 'rgb(107, 90, 179)',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index' as const,
          intersect: false
        },
        scales: {
          x: {
            barPercentage: 0.5,
            categoryPercentage: 0.6
          },
          y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
              display: true,
              text: 'Cantidad'
            }
          },
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            title: {
              display: true,
              text: 'Total (S/)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top' as const
          }
        }
      }
    } as ChartConfiguration);
  }

  copiarReporte(): void {
    if (this.productosBajoStock.length === 0) {
      alert('No hay productos con bajo stock para copiar');
      return;
    }

    this.dialog.open(CopiarReporteDialogComponent, {
      width: '600px',
      data: { productos: this.productosBajoStock }
    });
  }

  descargarPDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 15;

    // Título
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Productos con Bajo Stock', pageWidth / 2, currentY, { align: 'center' });
    currentY += 7;

    // Fecha
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Tabla
    if (this.productosBajoStock.length > 0) {
      const columns = ['Marca', 'Modelo', 'Año', 'Tipo', 'Calidad', 'Stock'];
      const columnWidths = [25, 25, 15, 25, 25, 15];
      const rowHeight = 8;
      const tableStartX = 10;
      const tableStartY = currentY;

      // Dibujar encabezados
      let xPos = tableStartX;
      for (let i = 0; i < columns.length; i++) {
        // Fondo azul para encabezado
        doc.setFillColor(111, 143, 226);
        doc.rect(xPos, tableStartY, columnWidths[i], rowHeight, 'F');
        
        // Borde negro
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(xPos, tableStartY, columnWidths[i], rowHeight);
        
        // Texto blanco
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(columns[i], xPos + columnWidths[i] / 2, tableStartY + rowHeight / 2 + 1, {
          align: 'center',
          maxWidth: columnWidths[i] - 2
        });
        xPos += columnWidths[i];
      }

      // Dibujar filas de datos
      let yPos = tableStartY + rowHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      for (let i = 0; i < this.productosBajoStock.length; i++) {
        const p = this.productosBajoStock[i];

        // Verificar si necesita nueva página
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 15;

          // Repetir encabezados en nueva página
          xPos = tableStartX;
          for (let j = 0; j < columns.length; j++) {
            doc.setFillColor(111, 143, 226);
            doc.rect(xPos, yPos, columnWidths[j], rowHeight, 'F');
            
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.rect(xPos, yPos, columnWidths[j], rowHeight);
            
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(columns[j], xPos + columnWidths[j] / 2, yPos + rowHeight / 2 + 1, {
              align: 'center',
              maxWidth: columnWidths[j] - 2
            });
            xPos += columnWidths[j];
          }

          yPos += rowHeight;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
        }

        // Determinar color alterno para esta fila
        const isEven = i % 2 === 0;
        const bgColor = isEven ? [244, 242, 251] : [255, 255, 255];

        // Dibujar celdas de datos
        const rowData = [
          p.marcaVehiculo || '-',
          p.modeloVehiculo || '-',
          p.anioVehiculo?.toString() || '-',
          p.tipoVidrio || '-',
          p.calidadVidrio || '-',
          p.stockActual.toString()
        ];

        xPos = tableStartX;
        for (let j = 0; j < rowData.length; j++) {
          // Fondo alterno
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(xPos, yPos, columnWidths[j], rowHeight, 'F');
          
          // Borde
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(xPos, yPos, columnWidths[j], rowHeight);
          
          // Texto negro
          doc.setTextColor(0, 0, 0);
          doc.text(rowData[j], xPos + columnWidths[j] / 2, yPos + rowHeight / 2 + 1, {
            align: 'center',
            maxWidth: columnWidths[j] - 2
          });
          xPos += columnWidths[j];
        }

        yPos += rowHeight;
      }

      currentY = yPos + 5;
    } else {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text('No hay productos con bajo stock', pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;
    }

    // Resumen
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de artículos únicos con bajo stock: ${this.productosBajoStock.length}`, 10, currentY);

    // Descargar
    doc.save(`reporte-bajo-stock-${new Date().getTime()}.pdf`);
  }
}

@Component({
  selector: 'app-copiar-reporte-dialog',
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="mb-4">Copiar Reporte</h2>
      
      <div class="max-h-96 overflow-y-auto mb-6">
        <table class="w-full text-sm border-collapse">
          <thead class="bg-sblue-100 sticky top-0">
            <tr>
              <th class="px-2 py-2 text-center w-8">
                <input type="checkbox" [checked]="todoSeleccionado()" (change)="toggleTodos()" />
              </th>
              <th class="px-2 py-2 text-left">Marca</th>
              <th class="px-2 py-2 text-left">Modelo</th>
              <th class="px-2 py-2 text-center">Año</th>
              <th class="px-2 py-2 text-left">Tipo</th>
              <th class="px-2 py-2 text-left">Calidad</th>
              <th class="px-2 py-2 text-center">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let producto of productosConDatailado; let i = index" [class]="i % 2 === 0 ? 'bg-sblue-50' : 'bg-white'">
              <td class="px-2 py-2 text-center border">
                <input 
                  type="checkbox" 
                  [(ngModel)]="producto.seleccionado"
                />
              </td>
              <td class="px-2 py-2 border">{{ producto.marcaVehiculo }}</td>
              <td class="px-2 py-2 border">{{ producto.modeloVehiculo }}</td>
              <td class="px-2 py-2 text-center border">{{ producto.anioVehiculo }}</td>
              <td class="px-2 py-2 border">{{ producto.tipoVidrio }}</td>
              <td class="px-2 py-2 border">{{ producto.calidadVidrio }}</td>
              <td class="px-2 py-2 border">
                <input 
                  type="number" 
                  min="0" 
                  [(ngModel)]="producto.cantidad"
                  class="w-16 px-2 py-1 border rounded"
                  [disabled]="!producto.seleccionado"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex gap-3 justify-end">
        <button mat-button (click)="dialogRef.close()">
          Cancelar
        </button>
        <button mat-raised-button color="primary" (click)="copiarSeleccionados()">
          <mat-icon>content_copy</mat-icon>
          Copiar Seleccionados
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class CopiarReporteDialogComponent {
  productosConDatailado: Array<ProductoBajoStockDTO & { seleccionado: boolean; cantidad: number }> = [];

  constructor(
    public dialogRef: MatDialogRef<CopiarReporteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productos: ProductoBajoStockDTO[] }
  ) {
    this.productosConDatailado = this.data.productos.map(p => ({
      ...p,
      seleccionado: true,
      cantidad: 1
    }));
  }

  todoSeleccionado(): boolean {
    return this.productosConDatailado.every(p => p.seleccionado);
  }

  toggleTodos(): void {
    const todosSeleccionados = this.todoSeleccionado();
    this.productosConDatailado.forEach(p => {
      p.seleccionado = !todosSeleccionados;
    });
  }

  copiarSeleccionados(): void {
    const seleccionados = this.productosConDatailado.filter(p => p.seleccionado);
    
    if (seleccionados.length === 0) {
      alert('Debe seleccionar al menos un producto');
      return;
    }

    let reporteTexto = '';
    
    seleccionados.forEach((producto, index) => {
      if (index > 0) {
        reporteTexto += '\n---\n';
      }
      reporteTexto += `Marca: ${producto.marcaVehiculo}\n`;
      reporteTexto += `Modelo: ${producto.modeloVehiculo}\n`;
      reporteTexto += `Año: ${producto.anioVehiculo}\n`;
      reporteTexto += `Tipo: ${producto.tipoVidrio}\n`;
      reporteTexto += `Calidad: ${producto.calidadVidrio}\n`;
      reporteTexto += `Cantidad: ${producto.cantidad}`;
    });

    navigator.clipboard.writeText(reporteTexto).then(() => {
      alert('Reporte copiado al portapapeles');
      this.dialogRef.close();
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert('Error al copiar el reporte');
    });
  }
}
