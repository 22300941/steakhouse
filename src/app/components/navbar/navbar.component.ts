import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

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

  get esAdmin() { return this.auth.esAdmin; }
  get nombre() { return this.auth.nombreUsuario; }
  get totalItems() { return this.carrito.totalItems(); }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
