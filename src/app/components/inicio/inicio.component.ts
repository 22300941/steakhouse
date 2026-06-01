import { Component, inject } from '@angular/core';
//import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent {
  auth = inject(AuthService);
  get esAdmin() { return this.auth.esAdmin; }
  get nombre() { return this.auth.nombreUsuario; }
}
