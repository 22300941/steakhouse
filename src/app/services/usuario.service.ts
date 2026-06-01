import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  getPerfil(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`);
  }

  actualizar(id: number, datos: Partial<Usuario> & { password?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, datos);
  }

  darDeBaja(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}/baja`, {});
  }
}