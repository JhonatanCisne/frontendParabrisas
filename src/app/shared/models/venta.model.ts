export interface DetalleVentaListDTO {
  idDetalleVenta?: number;
  idProducto: number;
  fecha?: string;
  hora?: string;
  marcaVehiculo?: string;
  modeloVehiculo?: string;
  anioVehiculo?: string;
  calidadVidrio?: string;
  tipoVidrio?: string;
  idProveedor?: number;
  precioVenta: number;
  cantidad: number;
  placaVehiculo?: string;
}

export interface VentaDT0 {
  idVenta?: number;
  idUsuario: number;
  fecha?: string;
  hora?: string;
  totalVenta: number;
  placaVehiculo: string;
  detalles: DetalleVentaListDTO[];
}

export type VentaDTO = VentaDT0;
