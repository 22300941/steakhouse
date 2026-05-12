import { Component, inject, signal, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CarritoMiniComponent } from '../carrito/carrito-mini.component';
import { ProveedorService } from '../../services/proveedor.service';
import { CarritoService } from '../../services/carrito.service';
import { Proveedor } from '../../models/proveedor.model';
import { Product } from '../../models/producto.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [NavbarComponent, CarritoMiniComponent, CurrencyPipe],
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css'],
})
export class CompraComponent implements OnInit {
  private proveedorService = inject(ProveedorService);
  private carritoService = inject(CarritoService);

  proveedores = signal<Proveedor[]>([]);
  productos = signal<Product[]>([]);
  proveedorSeleccionado = signal<number | null>(null);
  cargandoProductos = signal(false);

  ngOnInit() {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => this.proveedores.set(data),
      error: (e) => console.error('Error cargando proveedores:', e)
    });
  }

  seleccionarProveedor(id: number) {
    this.proveedorSeleccionado.set(id);
    this.productos.set([]);
    this.cargandoProductos.set(true);

    this.proveedorService.getProductosPorProveedor(id).subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargandoProductos.set(false);
      },
      error: (e) => {
        console.error('Error cargando productos:', e);
        this.cargandoProductos.set(false);
      }
    });
  }

  nombreProveedor(id: number | null): string {
    if (!id) return '';
    return this.proveedores().find(p => p.id === id)?.nombre ?? '';
  }

  agregar(producto: Product) {
  this.carritoService.origen = 'inversion';
  this.carritoService.agregar(producto);
  }
}
