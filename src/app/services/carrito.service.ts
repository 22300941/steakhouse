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
  productos = computed(() => this.itemsSignal().map(i => i.producto));

  agregar(producto: Product) {
  this.itemsSignal.update(lista => {
    const idx = lista.findIndex(i => i.producto.id === producto.id);
    if (idx >= 0) {
      const item = lista[idx];
      if (item.cantidad >= item.producto.inStock) return lista; // límite de stock
      const nueva = [...lista];
      nueva[idx] = { ...nueva[idx], cantidad: nueva[idx].cantidad + 1 };
      return nueva;
    }
    return [...lista, { producto, cantidad: 1 }];
  });
}

  sumarUno(id: number) {
  this.itemsSignal.update(lista => {
    const idx = lista.findIndex(i => i.producto.id === id);
    if (idx < 0) return lista;
    const item = lista[idx];
    if (item.cantidad >= item.producto.inStock) return lista; // límite de stock
    const nueva = [...lista];
    nueva[idx] = { ...nueva[idx], cantidad: nueva[idx].cantidad + 1 };
    return nueva;
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

  quitar(id: number) { this.quitarUno(id); }

  vaciar() { this.itemsSignal.set([]); }

  total(): number {
    return this.itemsSignal().reduce((acc, i) => acc + Number(i.producto.price) * i.cantidad, 0);
  }

  totalItems(): number {
    return this.itemsSignal().reduce((acc, i) => acc + i.cantidad, 0);
  }


  generarXML(responsable: string, id: number): string {
    const items = this.itemsSignal();
    const subtotal = this.total();
    const iva = subtotal * 0.16;
    const totalFinal = subtotal + iva;
    const fecha = new Date().toISOString().replace('T', 'T').split('.')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<cfdi:Comprobante\n`;
    xml += `  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"\n`;
    xml += `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"\n`;
    xml += `  Version="4.0"\n`;
    xml += `  Folio="${id}"\n`;
    xml += `  Fecha="${fecha}"\n`;
    xml += `  SubTotal="${subtotal.toFixed(2)}"\n`;
    xml += `  Moneda="MXN"\n`;
    xml += `  Total="${totalFinal.toFixed(2)}"\n`;
    xml += `  TipoDeComprobante="I"\n`;
    xml += `  Exportacion="01"\n`;
    xml += `  MetodoPago="PUE"\n`;
    xml += `  FormaPago="04"\n`;
    xml += `  LugarExpedicion="44100">\n\n`;

    xml += `  <cfdi:Emisor\n`;
    xml += `    Rfc="XAXX010101000"\n`;
    xml += `    Nombre="Garín Steakhouse"\n`;
    xml += `    RegimenFiscal="616"/>\n\n`;

    xml += `  <cfdi:Receptor\n`;
    xml += `    Rfc="XAXX010101000"\n`;
    xml += `    Nombre="${this.escapeXml(responsable)}"\n`;
    xml += `    DomicilioFiscalReceptor="44100"\n`;
    xml += `    RegimenFiscalReceptor="616"\n`;
    xml += `    UsoCFDI="G03"/>\n\n`;

    xml += `  <cfdi:Conceptos>\n`;
    for (const item of items) {
      const precio = Number(item.producto.price);
      const importe = precio * item.cantidad;
      xml += `    <cfdi:Concepto\n`;
      xml += `      ClaveProdServ="90101501"\n`;
      xml += `      Cantidad="${item.cantidad}"\n`;
      xml += `      ClaveUnidad="H87"\n`;
      xml += `      Unidad="Pieza"\n`;
      xml += `      Descripcion="${this.escapeXml(item.producto.name)}"\n`;
      xml += `      ValorUnitario="${precio.toFixed(2)}"\n`;
      xml += `      Importe="${importe.toFixed(2)}"\n`;
      xml += `      ObjetoImp="02">\n`;
      xml += `      <cfdi:Impuestos>\n`;
      xml += `        <cfdi:Traslados>\n`;
      xml += `          <cfdi:Traslado\n`;
      xml += `            Base="${importe.toFixed(2)}"\n`;
      xml += `            Impuesto="002"\n`;
      xml += `            TipoFactor="Tasa"\n`;
      xml += `            TasaOCuota="0.160000"\n`;
      xml += `            Importe="${(importe * 0.16).toFixed(2)}"/>\n`;
      xml += `        </cfdi:Traslados>\n`;
      xml += `      </cfdi:Impuestos>\n`;
      xml += `    </cfdi:Concepto>\n`;
    }
    xml += `  </cfdi:Conceptos>\n\n`;

    xml += `  <cfdi:Impuestos TotalImpuestosTrasladados="${iva.toFixed(2)}">\n`;
    xml += `    <cfdi:Traslados>\n`;
    xml += `      <cfdi:Traslado\n`;
    xml += `        Base="${subtotal.toFixed(2)}"\n`;
    xml += `        Impuesto="002"\n`;
    xml += `        TipoFactor="Tasa"\n`;
    xml += `        TasaOCuota="0.160000"\n`;
    xml += `        Importe="${iva.toFixed(2)}"/>\n`;
    xml += `    </cfdi:Traslados>\n`;
    xml += `  </cfdi:Impuestos>\n\n`;

    xml += `</cfdi:Comprobante>`;
    return xml;
  }

  descargarXML(xml: string, id: number) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${id}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeXml(value: string): string {
    return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
  }
}