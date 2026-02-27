export interface ProductListDTO {
  idProducto: number;
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  calidadVidrio: string;
  tipoVidrio: string;
  nombreProveedor: string;
  costoCompra: number;
  precioVenta: number;
  stockActual: number;
  ubicacionAlmacen: string;
}

export interface FiltroVidrioDTO {
  marcaVehiculo?: string;
  modeloVehiculo?: string;
  anioVehiculo?: string;
  tipoVidrio?: string;
  calidadVidrio?: string;
  nombreProveedor?: string;
  precioVenta?: number;
  disponible?: boolean;
}
