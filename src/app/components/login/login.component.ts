import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

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
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/inicio']);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Usuario o contraseña incorrectos.');
      }
    });
  }
}
