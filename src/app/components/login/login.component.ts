import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  username = signal('');
  password = signal('');
  error = signal('');
  cargando = signal(false);

  iniciarSesion() {
    if (!this.username() || !this.password()) {
      this.error.set('Por favor ingresa usuario y contraseña.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    this.auth.login(this.username(), this.password()).subscribe({
      next: (res) => {
  this.cargando.set(false);
  this.toast.exito(`¡Bienvenido, ${res.usuario.nombre}!`);
  if (res.usuario.rol === 'admin') {
    this.router.navigate(['/inventario']);
  } else {
    this.router.navigate(['/inicio']);
  }
},
error: (err) => {
  this.cargando.set(false);
  const msg = err.error?.error ?? 'Usuario o contraseña incorrectos.';
  this.error.set(msg);
  this.toast.error(msg);
}
    });
  }
}