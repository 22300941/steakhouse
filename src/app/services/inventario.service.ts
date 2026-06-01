import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/inventario';

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  crear(producto: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, producto);
  }

  actualizar(id: number, producto: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${id}/baja`, {});
}
  actualizarStock(items: {id: number, cantidad: number}[]): Observable<any> {
  return this.http.post(`${this.apiUrl}/stock`, { items });
}
getVigentes(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.apiUrl}/vigente`);
}
reactivar(id: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/reactivar`, {});
}
}
