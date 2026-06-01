import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';
import { HistorialService } from '../../services/historial.service';
import { InventarioService } from '../../services/inventario.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { environment } from '../../../enviroments/enviroment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, NavbarComponent],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private paypalService = inject(PaypalService);
  private historialService = inject(HistorialService);
  private inventarioService = inject(InventarioService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  items = this.carritoService.items;
  subtotal = computed(() => this.carritoService.total());
  impuesto = computed(() => this.carritoService.total() * 0.16);
  totalFinal = computed(() => this.carritoService.total() * 1.16);

  mensajePago = signal('');
  mostrarPago = signal(false);

  ngOnInit() {}

  confirmarCompra() {
  this.mostrarPago.set(true);
  this.toast.info('Selecciona tu método de pago.');
  setTimeout(() => this.cargarSDKPaypal(), 100);
}

  cargarSDKPaypal() {
    if (document.getElementById('paypal-sdk')) {
      this.renderBotonPaypal();
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=MXN&intent=capture`;
    script.onload = () => this.renderBotonPaypal();
    document.body.appendChild(script);
  }

  renderBotonPaypal() {
    setTimeout(() => {
      const contenedor = document.getElementById('paypal-buttons');
      if (!contenedor || contenedor.childElementCount > 0) return;

      (window as any).paypal?.Buttons({
        createOrder: () => {
        const subtotal = this.items().reduce((acc, i) => acc + Number(i.producto.price) * i.cantidad, 0);
        const iva = subtotal * 0.16;
        const totalConIva = subtotal + iva;
        const precioConIvaPorItem = (precio: number) => Number((precio * 1.16).toFixed(2));

        return this.paypalService.crearOrden({
          items: this.items().map(i => ({
            nombre: i.producto.name,
            cantidad: i.cantidad,
            precio: precioConIvaPorItem(Number(i.producto.price))
          })),
          total: Number(totalConIva.toFixed(2))
        }).toPromise().then((orden: any) => orden.id);
      },
        onApprove: (data: any) => {
          return this.paypalService.capturarOrden(data.orderID).toPromise().then(() => {
            this.guardarHistorial();
          });
        },
        onError: (err: any) => {
          this.mensajePago.set(`❌ Error en el pago: ${err}`);
        }
      }).render('#paypal-buttons');
    }, 400);
  }

  guardarHistorial() {
    const fecha = new Date().toISOString().split('T')[0];
    const responsable = this.auth.nombreUsuario;
    const totalConIva = this.totalFinal();

    // Generar XML con ID temporal, se actualizará con el ID real
    const xmlTemp = this.carritoService.generarXML(responsable, 0);

    const payload = {
      usuario_id: this.auth.idUsuario,
      usuario_nombre: responsable,
      fecha,
      total: totalConIva,
      email: this.auth.emailUsuario,
      xml_ticket: xmlTemp,
      items: this.items().map(i => ({
        producto_nombre: i.producto.name,
        producto_precio: Number(i.producto.price),
        cantidad: i.cantidad,
        total_linea: Number(i.producto.price) * i.cantidad
      }))
    };

    this.historialService.crear(payload).subscribe({
      next: (res) => {
        // Generar XML con el ID real y descargarlo
        const xmlFinal = this.carritoService.generarXML(responsable, res.id);
        this.carritoService.descargarXML(xmlFinal, res.id);

        // Actualizar stock
        const stockItems = this.items().map(i => ({ id: i.producto.id, cantidad: i.cantidad }));
        this.inventarioService.actualizarStock(stockItems).subscribe();

        this.toast.exito('✅ Pago completado. Ticket enviado a tu correo.');
        this.mensajePago.set('✅ Pago completado. Tu ticket ha sido enviado al correo.');
        this.carritoService.vaciar();
        this.mostrarPago.set(false);
      },
      error: (e) => {
        console.error('Error guardando historial:', e);
        this.mensajePago.set('✅ Pago completado.');
        this.carritoService.vaciar();
      }
    });
  }

  quitarUno(id: number) { this.carritoService.quitarUno(id); }
  quitarTodo(id: number) {
  this.carritoService.quitarTodo(id);
  this.toast.advertencia('Producto eliminado del carrito.');
}
  sumarUno(id: number) { this.carritoService.sumarUno(id); }
vaciar() {
  this.carritoService.vaciar();
  this.toast.info('Carrito vaciado.');
}
}