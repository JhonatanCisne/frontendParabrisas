import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaDTO } from '../../../shared/models';

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
}
