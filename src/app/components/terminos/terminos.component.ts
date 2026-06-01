import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [],
  template: '<p style="color:white;padding:20px">Redirigiendo...</p>',
})
export class TerminosComponent {
  constructor(private router: Router) {
    window.location.href = 'assets/terminos.pdf';
  }
}