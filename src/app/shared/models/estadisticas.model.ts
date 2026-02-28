export interface VidrioMasVendidoDTO {
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  tipoVidrio: string;
  calidadVidrio: string;
}

export interface EstadisticasDTO {
  vidrioMasVendido: VidrioMasVendidoDTO;
  totalVidriosVendidos: number;
  totalVidriosEnStock: number;
  totalGeneralVentas: number;
}

export interface ProductoBajoStockDTO {
  idProducto: number;
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  tipoVidrio: string;
  calidadVidrio: string;
  nombreProveedor: string;
  stockActual: number;
  precioVenta: number;
  stockBajoAlerta: boolean;
}

export interface VentasPorMesDTO {
  mes: string;
  cantidad: number;
  totalVentas: number;
}

export interface VentasPorProductoDTO {
  marcaVehiculo: string;
  modeloVehiculo: string;
  anioVehiculo: string;
  tipoVidrio: string;
  calidadVidrio: string;
  cantidad: number;
}
