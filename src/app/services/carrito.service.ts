import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/producto.model';

export interface ItemCarrito {
  producto: Product;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  origen: 'ganancia' | 'inversion' = 'ganancia';
  private itemsSignal = signal<ItemCarrito[]>([]);

  items = this.itemsSignal.asReadonly();

  // Para compatibilidad con código anterior
  productos = computed(() => this.itemsSignal().map(i => i.producto));

  agregar(producto: Product) {
    
    this.itemsSignal.update(lista => {
      const idx = lista.findIndex(i => i.producto.id === producto.id);
      if (idx >= 0) {
        const nueva = [...lista];
        nueva[idx] = { ...nueva[idx], cantidad: nueva[idx].cantidad + 1 };
        return nueva;
      }
      return [...lista, { producto, cantidad: 1 }];
    });
  }

  quitarUno(id: number) {
    this.itemsSignal.update(lista => {
      const idx = lista.findIndex(i => i.producto.id === id);
      if (idx < 0) return lista;
      const nueva = [...lista];
      if (nueva[idx].cantidad > 1) {
        nueva[idx] = { ...nueva[idx], cantidad: nueva[idx].cantidad - 1 };
      } else {
        nueva.splice(idx, 1);
      }
      return nueva;
    });
  }

  quitarTodo(id: number) {
    this.itemsSignal.update(lista => lista.filter(i => i.producto.id !== id));
  }

  quitar(id: number) {
    this.quitarUno(id);
  }

  vaciar() {
    this.itemsSignal.set([]);
  }

  total(): number {
    return this.itemsSignal().reduce((acc, i) => acc + i.producto.price * i.cantidad, 0);
  }

  totalItems(): number {
    return this.itemsSignal().reduce((acc, i) => acc + i.cantidad, 0);
  }

  exportarXML(responsable: string = 'Empleado'): string {
    const items = this.itemsSignal();
    const fecha = new Date().toLocaleDateString('es-MX');
    const subtotal = this.total();
    const impuesto = subtotal * 0.16;
    const totalFinal = subtotal + impuesto;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Ticket>\n`;
    xml += `  <Fecha>${fecha}</Fecha>\n`;
    xml += `  <Responsable>${this.escapeXml(responsable)}</Responsable>\n`;
    xml += `  <Productos>\n`;

    for (const item of items) {
      const precio = Number(item.producto.price);
const totalLinea = precio * item.cantidad;

      xml += `    <Producto>\n`;
      xml += `      <Nombre>${this.escapeXml(item.producto.name)}</Nombre>\n`;
      xml += `      <Cantidad>${item.cantidad}</Cantidad>\n`;
   xml += `      <PrecioUnitario>${precio.toFixed(2)}</PrecioUnitario>\n`;
xml += `      <TotalLinea>${totalLinea.toFixed(2)}</TotalLinea>\n`;
      xml += `    </Producto>\n`;
    }

    xml += `  </Productos>\n`;
xml += `  <Subtotal>${Number(subtotal).toFixed(2)}</Subtotal>\n`;
xml += `  <Impuesto>${Number(impuesto).toFixed(2)}</Impuesto>\n`;
xml += `  <Total>${Number(totalFinal).toFixed(2)}</Total>\n`;
    xml += `</Ticket>`;

    return xml;
  }

  descargarXML(responsable: string = 'Empleado') {
    const xml = this.exportarXML(responsable);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }
}
