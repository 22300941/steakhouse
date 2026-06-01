import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NavbarComponent, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  private auth = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private toast = inject(ToastService);

  username = signal('');
  password = signal('');
  foto = signal('');
  fechaMod = signal('');
  exito = signal('');
  error = signal('');
  cargando = signal(false);

  ngOnInit() {
    this.usuarioService.getPerfil(this.auth.idUsuario).subscribe({
      next: (u) => {
        this.username.set(u.username);
        this.foto.set(u.foto ?? '');
        this.fechaMod.set(u.fecha_modificacion ?? '');
      }
    });
  }

  onFotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.foto.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardar() {
    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');
    const datos: any = { username: this.username(), foto: this.foto() };
    if (this.password()) datos.password = this.password();

    this.usuarioService.actualizar(this.auth.idUsuario, datos).subscribe({
      next: () => {
  this.cargando.set(false);
  this.toast.exito('Perfil actualizado correctamente.');
  this.exito.set('Perfil actualizado correctamente.');
  this.password.set('');
  // Actualizar localStorage para reflejar cambios
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      const u = JSON.parse(stored);
      u.username = this.username();
      u.foto = this.foto();
      localStorage.setItem('usuario', JSON.stringify(u));
      this.auth.cargarDesdeStorage();
    }
  }
},
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.error?.error ?? 'Error actualizando perfil.');
        this.error.set(err.error?.error ?? 'Error actualizando perfil.');
      }
    });
  }

  darDeBaja() {
    if (!confirm('¿Seguro que deseas dar de baja tu cuenta? Esta acción no se puede deshacer.')) return;
    this.usuarioService.darDeBaja(this.auth.idUsuario).subscribe({
      next: () => {
        this.auth.logout();
        this.toast.info('Cuenta dada de baja.');
        this.router.navigate(['/login']);
      }
    });
  }

  cerrarSesion() {
  this.toast.info('Sesión cerrada.');
  this.auth.logout();
  this.router.navigate(['/login']);
}
}