import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProveedorDTO } from '../../../shared/models';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private apiUrl = `${environment.apiUrl}/api/proveedores`;

  constructor(private http: HttpClient) {}

  listarProveedores(): Observable<ProveedorDTO[]> {
    return this.http.get<ProveedorDTO[]>(`${this.apiUrl}`);
  }

  crearProveedor(proveedor: ProveedorDTO): Observable<ProveedorDTO> {
    return this.http.post<ProveedorDTO>(`${this.apiUrl}/crear`, proveedor);
  }

  actualizarProveedor(proveedor: ProveedorDTO): Observable<ProveedorDTO> {
    return this.http.put<ProveedorDTO>(`${this.apiUrl}/actualizar`, proveedor);
  }

  actualizarMonto(nombre: string, monto: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/actualizar-monto/${nombre}`, null, {
      params: { monto: monto.toString() }
    });
  }

  obtenerPorNombre(nombre: string): Observable<ProveedorDTO> {
    return this.http.get<ProveedorDTO>(`${this.apiUrl}/nombre/${nombre}`);
  }

  obtenerPorEstado(estado: string): Observable<ProveedorDTO[]> {
    return this.http.get<ProveedorDTO[]>(`${this.apiUrl}/estado/${estado}`);
  }

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}
