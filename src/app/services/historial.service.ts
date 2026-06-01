import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Historial } from '../models/historial.model';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getByUsuario(usuarioId: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/historial/${usuarioId}`);
  }

  getById(id: number): Observable<Historial> {
    return this.http.get<Historial>(`${this.apiUrl}/historial/ticket/${id}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/historial`, data);
  }
}