import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CarritoMiniComponent } from '../carrito/carrito-mini.component';
import { InventarioService } from '../../services/inventario.service';
import { CarritoService } from '../../services/carrito.service';
import { Product } from '../../models/producto.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NavbarComponent, CarritoMiniComponent, CurrencyPipe],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private carritoService = inject(CarritoService);

  productos = signal<Product[]>([]);
  categoriaActiva = signal<string>('Todas');

  categorias = computed(() => {
    const cats = [...new Set(this.productos().map(p => p.category).filter(Boolean))];
    return ['Todas', ...cats];
  });

  productosFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    const lista = this.productos().filter(p => p.inStock > 0);
    if (cat === 'Todas') return lista;
    return lista.filter(p => p.category === cat);
  });

  ngOnInit() {
    this.inventarioService.getAll().subscribe({
      next: (data) => this.productos.set(data),
      error: (e) => console.error('Error cargando menú:', e)
    });
  }

  agregar(producto: Product) {
    this.carritoService.agregar(producto);
  }
}
