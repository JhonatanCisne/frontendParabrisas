export interface ProveedorDTO {
  idProveedor?: number;
  nombreProveedor: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  activo?: boolean;
}
