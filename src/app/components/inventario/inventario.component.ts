import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { InventarioService } from '../../services/inventario.service';
import { Product } from '../../models/producto.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CurrencyPipe],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);
  
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
/*next: () => { 
  this.cargar(); 
  this.cancelar(); 
  this.toast.exito(this.modoEdicion() ? 'Producto actualizado.' : 'Producto creado.');
},
error: (e) => {
  console.error(e);
  this.toast.error('Error al guardar el producto.');
}*/ 
    if (this.modoEdicion() && this.productoForm.id) {
      this.inventarioService.actualizar(this.productoForm.id, this.productoForm).subscribe({
        next: () => { this.cargar(); this.cancelar(); 
          this.toast.exito('Producto actualizado.');
         },
        error: (e) => {console.error('Error actualizando:', e);
        this.toast.error('Error al guardar el producto')}
      });
    } else {
      this.inventarioService.crear(this.productoForm as Omit<Product, 'id'>).subscribe({
        next: () => { this.cargar(); this.cancelar(); 
          this.toast.exito('Producto creado');
        },
        error: (e) => {console.error('Error creando:', e)
          this.toast.error("Error creando");
        }
      });
    }
  }

  darDeBaja(id: number) {
  if (!confirm('¿Seguro que deseas dar de baja este producto?')) return;
  this.inventarioService.eliminar(id).subscribe({
    next: () => {
  this.cargar();
  this.toast.advertencia('Producto dado de baja.');
},
  });
}

}
