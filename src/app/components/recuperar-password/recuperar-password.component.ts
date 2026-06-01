import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css'],
})
export class RecuperarPasswordComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  paso = signal<'correo' | 'codigo' | 'nueva-password'>('correo');
  email = signal('');
  codigo = signal('');
  nuevaPassword = signal('');
  confirmarPassword = signal('');
  username = signal('');
  error = signal('');
  exito = signal('');
  cargando = signal(false);

  enviarCodigo() {
    if (!this.email()) { this.error.set('Ingresa tu correo.'); return; }
    this.cargando.set(true);
    this.error.set('');

    this.auth.recuperarPassword(this.email()).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.username.set(res.username);
        this.paso.set('codigo');
        this.exito.set('Código enviado a tu correo.');
        this.toast.exito('Código enviado. Revisa tu correo.');
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err.error?.error ?? 'Error al enviar código.';
        this.error.set(msg);
        this.toast.error(msg);
      }
    });
  }

  verificarCodigo() {
    if (!this.codigo()) { this.error.set('Ingresa el código.'); return; }
    this.cargando.set(true);
    this.error.set('');

    this.auth.verificarCodigoRecuperacion(this.email(), this.codigo()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.paso.set('nueva-password');
        this.exito.set('Código verificado. Ingresa tu nueva contraseña.');
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err.error?.error ?? 'Código incorrecto.';
        this.error.set(msg);
        this.toast.error(msg);
      }
    });
  }

  cambiarPassword() {
    if (!this.nuevaPassword()) { this.error.set('Ingresa tu nueva contraseña.'); return; }
    if (this.nuevaPassword() !== this.confirmarPassword()) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    this.auth.cambiarPassword(this.email(), this.nuevaPassword()).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.toast.exito('Contraseña actualizada. Iniciando sesión...');
        this.auth.autoLogin(res.usuario, res.token);
        if (res.usuario.rol === 'admin') {
          this.router.navigate(['/inventario']);
        } else {
          this.router.navigate(['/inicio']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.toast.error(err.error?.error ?? 'Error actualizando contraseña.');
      }
    });
  }

  reenviarCodigo() {
    this.cargando.set(true);
    this.auth.reenviarCodigo(this.email()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.toast.exito('Nuevo código enviado.');
      },
      error: () => {
        this.cargando.set(false);
        this.toast.error('Error reenviando código.');
      }
    });
  }

  cancelar() {
    this.paso.set('correo');
    this.codigo.set('');
    this.error.set('');
    this.exito.set('');
  }
}