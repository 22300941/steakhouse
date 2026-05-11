import { Component, inject, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito-mini',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './carrito-mini.component.html',
  styleUrls: ['./carrito-mini.component.css'],
})
export class CarritoMiniComponent {
  carritoService = inject(CarritoService);
  items = this.carritoService.items;
  total = computed(() => this.carritoService.total());
}
