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
        this.iniciarTimeoutSesion();
      })
    );
  }

  registrar(username: string, password: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registrar`, { username, password, email });
  }

  confirmarCodigo(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/confirmar`, { email, codigo });
  }

  verificarUsername(username: string): Observable<{ disponible: boolean }> {
    return this.http.get<{ disponible: boolean }>(`${this.apiUrl}/auth/verificar-username/${username}`);
  }

  logout() {
    this.usuarioActual.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
    }
  }

  cargarDesdeStorage() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('usuario');
    if (stored) this.usuarioActual.set(JSON.parse(stored));
  }
  private timeoutSesion: any = null;

  iniciarTimeoutSesion() {
    this.limpiarTimeoutSesion();
    this.timeoutSesion = setTimeout(() => {
      this.logout();
      if (typeof window !== 'undefined') {
        alert('Tu sesión ha expirado por inactividad. Por favor inicia sesión nuevamente.');
        window.location.href = '/login';
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  limpiarTimeoutSesion() {
    if (this.timeoutSesion) clearTimeout(this.timeoutSesion);
  }

  reiniciarTimeoutSesion() {
    if (this.estaAutenticado) this.iniciarTimeoutSesion();
  }

  recuperarPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/recuperar-password`, { email });
  }

  verificarCodigoRecuperacion(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verificar-codigo-recuperacion`, { email, codigo });
  }

  cambiarPassword(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/cambiar-password`, { email, password });
  }

  reenviarCodigo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reenviar-codigo`, { email });
  }

  autoLogin(usuario: any, token: string) {
    this.usuarioActual.set(usuario);
    if (typeof window !== 'undefined') {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('token', token);
    }
    this.iniciarTimeoutSesion();
  }

  get estaAutenticado(): boolean { return this.usuarioActual() !== null; }
  get esAdmin(): boolean { return this.usuarioActual()?.rol === 'admin'; }
  get nombreUsuario(): string { return this.usuarioActual()?.nombre ?? ''; }
  get emailUsuario(): string { return this.usuarioActual()?.email ?? ''; }
  get idUsuario(): number { return this.usuarioActual()?.id ?? 0; }
  get fotoUsuario(): string { return this.usuarioActual()?.foto ?? ''; }
}