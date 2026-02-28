import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaDTO, EstadisticasDTO, VentasPorMesDTO, VentasPorProductoDTO } from '../../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  crearVenta(venta: VentaDTO): Observable<VentaDTO> {
    return this.http.post<VentaDTO>(`${this.apiUrl}/generar`, venta);
  }

  listarVentas(): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(`${this.apiUrl}/listar`);
  }

  buscarPorFecha(fecha: string): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(`${this.apiUrl}/buscar-fecha`, {
      params: { fecha }
    });
  }

  buscarPorPlaca(placa: string): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(`${this.apiUrl}/buscar-placa/${placa}`);
  }

  buscarPorRangoFechas(fechaInicio: string, fechaFin: string): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(`${this.apiUrl}/buscar-rango-fechas`, {
      params: { fechaInicio, fechaFin }
    });
  }

  buscarPorId(id: number): Observable<VentaDTO> {
    return this.http.get<VentaDTO>(`${this.apiUrl}/buscar/${id}`);
  }

  obtenerNombreUsuario(idUsuario: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/usuario-nombre/${idUsuario}`);
  }

  obtenerEstadisticas(): Observable<EstadisticasDTO> {
    return this.http.get<EstadisticasDTO>(`${this.apiUrl}/estadisticas`);
  }

  obtenerVentasPorMes(fechaInicio: string, fechaFin: string): Observable<VentasPorMesDTO[]> {
    return this.http.get<VentasPorMesDTO[]>(`${this.apiUrl}/ventas-por-mes`, {
      params: { fechaInicio, fechaFin }
    });
  }

  obtenerVentasPorMesFiltrado(mes: string, ano: number): Observable<VentasPorMesDTO[]> {
    return this.http.get<VentasPorMesDTO[]>(`${this.apiUrl}/ventas-por-mes-filtrado`, {
      params: { mes, ano: ano.toString() }
    });
  }

  obtenerVentasPorMesRango(mesInicio: string, mesFin: string, ano: number): Observable<VentasPorMesDTO[]> {
    return this.http.get<VentasPorMesDTO[]>(`${this.apiUrl}/ventas-por-mes-rango`, {
      params: { mesInicio, mesFin, ano: ano.toString() }
    });
  }

  obtenerVentasPorProducto(): Observable<VentasPorProductoDTO[]> {
    return this.http.get<VentasPorProductoDTO[]>(`${this.apiUrl}/ventas-por-producto`);
  }
}
