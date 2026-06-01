import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  auth = inject(AuthService);
  carrito = inject(CarritoService);
  private router = inject(Router);
  private toast = inject(ToastService);

  get esAdmin() { return this.auth.esAdmin; }
  get nombre() { return this.auth.nombreUsuario; }
  get totalItems() { return this.carrito.totalItems(); }
  get foto() { return this.auth.fotoUsuario; }

  cerrarSesion() {
    this.toast.info('Sesion cerrada.');
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}