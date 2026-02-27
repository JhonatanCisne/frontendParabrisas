export interface DetalleListCompraDTO {
  idDetallaCompra?: number;
  idProveedor?: number;
  idProducto: number;
  marcaVehiculo?: string;
  modeloVehiculo?: string;
  anioVehiculo?: string;
  calidadVidrio?: string;
  tipoVidrio?: string;
  costoCompra: number;
  cantidad: number;
}

export interface CompraDTO {
  idCompra?: number;
  nombreProveedor: string;
  idProveedor?: number;
  idUsuario?: number;
  fechaCompra?: string;
  totalCompra: number;
  detalle: DetalleListCompraDTO[];
}
