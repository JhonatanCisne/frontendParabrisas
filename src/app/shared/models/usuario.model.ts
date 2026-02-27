export interface UsuarioDTO {
  idUsuario?: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  contrasena?: string;
}

export interface UsuarioReferencia {
  idUsuario: number;
  nombres: string;
  apellidos: string;
}

export interface NombreUsuarioDTO {
  idUsuario: number;
  nombres: string;
  apellidos: string;
}
