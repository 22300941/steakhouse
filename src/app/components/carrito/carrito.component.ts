import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { environment } from '../../../enviroments/enviroment';

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
  private ticketService = inject(TicketService);
  private auth = inject(AuthService);

  items = this.carritoService.items;
  total = computed(() => this.carritoService.total());
  subtotal = computed(() => this.carritoService.total());
  impuesto = computed(() => this.carritoService.total() * 0.16);
  totalFinal = computed(() => this.carritoService.total() * 1.16);

  mensajePago = signal('');
  mostrarPago = signal(false);

  ngOnInit() {
    this.cargarSDKPaypal();
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
          return this.paypalService.crearOrden({
            items: this.items().map(i => ({
  nombre: i.producto.name,
  cantidad: i.cantidad,
  precio: Number(i.producto.price)
})),
total: Number(this.totalFinal())
    
          }).toPromise().then((orden: any) => orden.id);
        },
        onApprove: (data: any) => {
          return this.paypalService.capturarOrden(data.orderID).toPromise().then(() => {
            this.guardarTicket();
            this.mensajePago.set('✅ Pago con PayPal completado exitosamente.');
            this.carritoService.vaciar();
          });
        },
        onError: (err: any) => {
          this.mensajePago.set(`❌ Error en el pago: ${err}`);
        }
      }).render('#paypal-buttons');
    }, 400);
  }

  generarXML() {
    this.guardarTicket();
    this.carritoService.descargarXML(this.auth.nombreUsuario);
  }

  guardarTicket() {
    const ticket = {
      fecha: new Date().toISOString().split('T')[0],
      responsable: this.auth.nombreUsuario || 'Sistema',
      cantidad: this.totalFinal(),
      items: this.items().map(i => ({
        producto: i.producto.name,
        cantidad: i.cantidad,
        precio_unitario: i.producto.price,
        total_linea: i.producto.price * i.cantidad
      }))
    };
    this.ticketService.crear(ticket).subscribe({
      error: (e) => console.error('Error guardando ticket:', e)
    });
  }

  quitarUno(id: number) { this.carritoService.quitarUno(id); }
  quitarTodo(id: number) { this.carritoService.quitarTodo(id); }
  vaciar() { this.carritoService.vaciar(); }
}
