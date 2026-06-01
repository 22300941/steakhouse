import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { HistorialService } from '../../services/historial.service';
import { AuthService } from '../../services/auth.service';
import { Historial } from '../../models/historial.model';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [NavbarComponent, CurrencyPipe],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
})
export class HistorialComponent implements OnInit {
  private historialService = inject(HistorialService);
  private auth = inject(AuthService);
  private carritoService = inject(CarritoService);

  historial = signal<Historial[]>([]);
  ticketDetalle = signal<Historial | null>(null);
  total = computed(() => this.historial().reduce((acc, h) => acc + h.total, 0));

  ngOnInit() {
    this.historialService.getByUsuario(this.auth.idUsuario).subscribe({
      next: (data) => this.historial.set(data),
      error: (e) => console.error('Error cargando historial:', e)
    });
  }

  verTicket(id: number) {
    this.historialService.getById(id).subscribe({
      next: (t) => this.ticketDetalle.set(t),
      error: (e) => console.error('Error cargando ticket:', e)
    });
  }

  descargarXML(ticket: Historial) {
    if (!ticket.xml_ticket) return;
    const blob = new Blob([ticket.xml_ticket], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${ticket.id}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  cerrarDetalle() { this.ticketDetalle.set(null); }
}