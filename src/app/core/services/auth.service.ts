import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, AuthResponse, UsuarioDTO } from '../../shared/models';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response));
        this.tokenSubject.next(response.token);
      })
    );
  }

  registro(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/registro`, usuario);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  getCurrentUserRole(): string {
    return (this.getCurrentUser()?.rol || '').toString().toUpperCase();
  }

  hasRole(roles: string[]): boolean {
    const currentRole = this.getCurrentUserRole();
    return roles.map((role) => role.toUpperCase()).includes(currentRole);
  }

  // Extrae el idUsuario del JWT si no está disponible en el usuario almacenado
  getCurrentUserId(): number {
    const usuario = this.getCurrentUser();
    if (usuario && usuario.idUsuario) {
      return usuario.idUsuario;
    }

    // Si no está en el usuario, intentar extraer del JWT
    const token = this.getToken();
    if (token) {
      try {
        // Decodificar JWT (sin verificación, solo para obtener el payload)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          return payload.idUsuario;
        }
      } catch (error) {
        console.error('Error al decodificar JWT:', error);
      }
    }

    return 0; // Valor por defecto
  }
}
