import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/producto.model';
import { Proveedor } from '../models/proveedor.model';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`);
  }

  getProductosPorProveedor(proveedorId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/proveedores/${proveedorId}/productos`);
  }
}
