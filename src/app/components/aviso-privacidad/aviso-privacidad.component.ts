import { Component } from '@angular/core';

@Component({
  selector: 'app-aviso-privacidad',
  standalone: true,
  imports: [],
  template: '<p style="color:white;padding:20px">Redirigiendo...</p>',
})
export class AvisoPrivacidadComponent {
  constructor() {
    window.location.href = 'assets/aviso-privacidad.pdf';
  }
}