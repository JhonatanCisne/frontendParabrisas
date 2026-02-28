import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDTO, UsuarioReferencia } from '../../../shared/models';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  crearUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/registro`, usuario);
  }

  actualizarUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/actualizar`, usuario);
  }

  obtenerReferencia(id: number): Observable<UsuarioReferencia> {
    return this.http.get<UsuarioReferencia>(`${this.apiUrl}/referencia/${id}`);
  }

  buscarPorCorreo(correo: string): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/buscar/${correo}`);
  }

  eliminarPorCorreo(correo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${correo}`);
  }

  listarTodos(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/listar`);
  }
}
