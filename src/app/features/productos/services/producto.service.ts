import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductListDTO, FiltroVidrioDTO } from '../../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  getCatalogo(filtro: FiltroVidrioDTO = {}): Observable<ProductListDTO[]> {
    return this.http.post<ProductListDTO[]>(`${this.apiUrl}/catalogo`, filtro);
  }

  filtrarProductos(filtro: FiltroVidrioDTO): Observable<ProductListDTO[]> {
    return this.http.post<ProductListDTO[]>(`${this.apiUrl}/catalogo`, filtro);
  }

  getProductoById(id: number): Observable<ProductListDTO> {
    return this.http.get<ProductListDTO>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: ProductListDTO): Observable<ProductListDTO> {
    return this.http.post<ProductListDTO>(`${this.apiUrl}/crear`, producto);
  }

  actualizarProducto(producto: ProductListDTO): Observable<ProductListDTO> {
    return this.http.put<ProductListDTO>(`${this.apiUrl}/actualizar`, producto);
  }

  descontarStock(id: number, cantidad: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/stock/descontar`, null, {
      params: { cantidad: cantidad.toString() }
    });
  }

  anadirStock(id: number, cantidad: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/stock/anadir`, null, {
      params: { cantidad: cantidad.toString() }
    });
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

  buscarPorPlaca(placa: string): Observable<ProductListDTO[]> {
    return this.http.get<ProductListDTO[]>(`${this.apiUrl}/buscar-placa/${placa}`);
  }
}
