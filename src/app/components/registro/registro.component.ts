import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  

  username = signal('');
  password = signal('');
  passwordOriginal = signal('');
  email = signal('');
  aceptaTerminos = signal(false);
  usernameDisponible = signal<boolean | null>(null);
  paso = signal<'registro' | 'confirmacion'>('registro');
  codigo = signal('');
  error = signal('');
  exito = signal('');
  cargando = signal(false);

  verificarUsername() {
    const u = this.username();
    if (u.length < 3) { this.usernameDisponible.set(null); return; }
    this.auth.verificarUsername(u).subscribe({
      next: (res) => this.usernameDisponible.set(res.disponible),
      error: () => this.usernameDisponible.set(null)
    });
  }

  registrar() {
    if (!this.username() || !this.password() || !this.email()) {
      this.error.set('Todos los campos son requeridos.');
      return;
    }
    if (!this.aceptaTerminos()) {
      this.error.set('Debes aceptar los términos y condiciones.');
      return;
    }
    if (this.usernameDisponible() === false) {
      this.error.set('El nombre de usuario no está disponible.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    this.passwordOriginal.set(this.password());
    this.auth.registrar(this.username(), this.password(), this.email()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.paso.set('confirmacion');
        this.toast.exito('Código enviado a tu correo.');
        this.exito.set('Código enviado a tu correo.');
        
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.error?.error ?? 'Error al registrar.');
        this.error.set(err.error?.error ?? 'Error al registrar.');
      }
    });
  }

confirmar() {
  if (!this.codigo()) { this.error.set('Ingresa el código.'); return; }
  this.cargando.set(true);
  this.error.set('');

  this.auth.confirmarCodigo(this.email(), this.codigo()).subscribe({
    next: () => {
      this.cargando.set(false);
      this.toast.exito('¡Cuenta creada! Iniciando sesión...');
      // Auto-login después del registro
      this.auth.login(this.username(), this.passwordOriginal()).subscribe({
        next: (res) => {
          if (res.usuario.rol === 'admin') {
            this.router.navigate(['/inventario']);
          } else {
            this.router.navigate(['/inicio']);
          }
        },
        error: () => this.router.navigate(['/login'])
      });
    },
    error: (err) => {
      this.cargando.set(false);
      this.error.set(err.error?.error ?? 'Código incorrecto.');
      this.toast.error(err.error?.error ?? 'Código incorrecto.');
    }
  });
} 
  cancelarRegistro() {
    this.paso.set('registro');
    this.codigo.set('');
    this.error.set('');
    this.exito.set('');
  }

  reenviarCodigo() {
    this.cargando.set(true);
    this.auth.reenviarCodigo(this.email()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.toast.exito('Nuevo código enviado a tu correo.');
        this.exito.set('Nuevo código enviado.');
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.error?.error ?? 'Error reenviando código.');
      }
    });
  }
}