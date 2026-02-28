import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompraDTO } from '../../../shared/models';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = `${environment.apiUrl}/api/compras`;

  constructor(private http: HttpClient) {}

  crearCompra(compra: CompraDTO): Observable<CompraDTO> {
    return this.http.post<CompraDTO>(`${this.apiUrl}/generar`, compra);
  }

  listarCompras(): Observable<CompraDTO[]> {
    return this.http.get<CompraDTO[]>(`${this.apiUrl}/listar`);
  }

  buscarPorFecha(fecha: string): Observable<CompraDTO[]> {
    return this.http.get<CompraDTO[]>(`${this.apiUrl}/buscar-fecha`, {
      params: { fecha }
    });
  }

  buscarPorRangoFechas(fechaInicio: string, fechaFin: string): Observable<CompraDTO[]> {
    return this.http.get<CompraDTO[]>(`${this.apiUrl}/buscar-rango-fechas`, {
      params: { fechaInicio, fechaFin }
    });
  }

  buscarPorId(id: number): Observable<CompraDTO> {
    return this.http.get<CompraDTO>(`${this.apiUrl}/buscar/${id}`);
  }

  obtenerNombreUsuario(idUsuario: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/usuario-nombre/${idUsuario}`);
  }
}
