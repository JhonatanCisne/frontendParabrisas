import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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
  private expirationTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone
  ) {}

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response));
        this.tokenSubject.next(response.token);
        this.scheduleTokenExpiration(response.token);
      })
    );
  }

  registro(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/registro`, usuario);
  }

  logout(): void {
    this.clearExpirationTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      // exp está en segundos, Date.now() en milisegundos
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /** Verifica la sesión al iniciar la app y limpia si el token expiró */
  checkSession(): void {
    const token = this.getToken();
    if (!token) return;

    if (this.isTokenExpired(token)) {
      this.logout();
      this.router.navigate(['/login']);
    } else {
      // Token aún válido: programar limpieza automática al expirar
      this.scheduleTokenExpiration(token);
    }
  }

  /** Programa un temporizador que limpia el token y redirige al login cuando expire */
  private scheduleTokenExpiration(token: string): void {
    this.clearExpirationTimer();

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return;

      const expiresIn = payload.exp * 1000 - Date.now();
      if (expiresIn <= 0) {
        this.logout();
        this.router.navigate(['/login']);
        return;
      }

      // Ejecutar fuera de NgZone para no disparar detección de cambios innecesaria
      this.ngZone.runOutsideAngular(() => {
        this.expirationTimer = setTimeout(() => {
          this.ngZone.run(() => {
            this.logout();
            this.router.navigate(['/login']);
          });
        }, expiresIn);
      });
    } catch {
      // Token inválido, limpiar
      this.logout();
    }
  }

  private clearExpirationTimer(): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
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
