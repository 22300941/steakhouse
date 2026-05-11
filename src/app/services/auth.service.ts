import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  private usuarioActual = signal<Usuario | null>(null);
  usuario = this.usuarioActual.asReadonly();

  login(username: string, password: string): Observable<{ usuario: Usuario; token: string }> {
    return this.http.post<{ usuario: Usuario; token: string }>(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap(res => {
        this.usuarioActual.set(res.usuario);
        if (typeof window !== 'undefined') {
  localStorage.setItem('usuario', JSON.stringify(res.usuario));
  localStorage.setItem('token', res.token);
}
      })
    );
  }

  logout() {
    this.usuarioActual.set(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }

cargarDesdeStorage() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('usuario');
  if (stored) {
    this.usuarioActual.set(JSON.parse(stored));
  }
}

  get estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }

  get esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'admin';
  }

  get nombreUsuario(): string {
    return this.usuarioActual()?.nombre ?? '';
  }
}
