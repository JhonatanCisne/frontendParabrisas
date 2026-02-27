export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  mensaje: string;
  nombres: string;
  rol: string;
  expiraEn: number;
  idUsuario?: number;
  nombreUsuario?: string;
}

export interface UsuarioDTO {
  idUsuario?: number;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena?: string;
  rol: string;
}

export interface UsuarioReferencia {
  idUsuario: number;
  nombre: string;
  apellido: string;
}
