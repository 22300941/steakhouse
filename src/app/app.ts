import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class App implements OnInit {
  private auth = inject(AuthService);

  ngOnInit() {
    // Restaurar sesión desde localStorage al recargar
    this.auth.cargarDesdeStorage();
  }
}
