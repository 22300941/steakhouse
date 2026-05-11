import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { InventarioService } from '../../services/inventario.service';
import { Product } from '../../models/producto.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CurrencyPipe],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);

  productos = signal<Product[]>([]);
  mostrarFormulario = signal(false);
  modoEdicion = signal(false);
  busqueda = signal('');

  productoForm: Partial<Product> = this.formularioVacio();

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.inventarioService.getAll().subscribe({
      next: (data) => this.productos.set(data),
      error: (e) => console.error('Error cargando inventario:', e)
    });
  }

  formularioVacio(): Partial<Product> {
    return { name: '', price: 0, imageURL: '', category: '', description: '', inStock: 0, proveedor: '' };
  }

  productosFiltrados(): Product[] {
    const q = this.busqueda().toLowerCase();
    if (!q) return this.productos();
    return this.productos().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.proveedor ?? '').toLowerCase().includes(q)
    );
  }

  abrirAgregar() {
    this.productoForm = this.formularioVacio();
    this.modoEdicion.set(false);
    this.mostrarFormulario.set(true);
  }

  abrirEditar(p: Product) {
    this.productoForm = { ...p };
    this.modoEdicion.set(true);
    this.mostrarFormulario.set(true);
  }

  cancelar() {
    this.mostrarFormulario.set(false);
    this.productoForm = this.formularioVacio();
  }

  guardar() {
    if (!this.productoForm.name || this.productoForm.price == null) return;

    if (this.modoEdicion() && this.productoForm.id) {
      this.inventarioService.actualizar(this.productoForm.id, this.productoForm).subscribe({
        next: () => { this.cargar(); this.cancelar(); },
        error: (e) => console.error('Error actualizando:', e)
      });
    } else {
      this.inventarioService.crear(this.productoForm as Omit<Product, 'id'>).subscribe({
        next: () => { this.cargar(); this.cancelar(); },
        error: (e) => console.error('Error creando:', e)
      });
    }
  }

  eliminar(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    this.inventarioService.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: (e) => console.error('Error eliminando:', e)
    });
  }
}
