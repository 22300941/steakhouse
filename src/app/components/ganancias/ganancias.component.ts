import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-ganancias',
  standalone: true,
  imports: [NavbarComponent, CurrencyPipe, DatePipe],
  templateUrl: './ganancias.component.html',
  styleUrls: ['./ganancias.component.css'],
})
export class GananciasComponent implements OnInit {
  private ticketService = inject(TicketService);

  tickets = signal<Ticket[]>([]);
  ticketDetalle = signal<Ticket | null>(null);

  total = computed(() => this.tickets().reduce((acc, t) => acc + t.cantidad, 0));

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.ticketService.getAll().subscribe({
      next: (data) => this.tickets.set(data),
      error: (e) => console.error('Error cargando tickets:', e)
    });
  }

  verTicket(id: number) {
    this.ticketService.getById(id).subscribe({
      next: (t) => this.ticketDetalle.set(t),
      error: (e) => console.error('Error cargando ticket:', e)
    });
  }

  cerrarDetalle() {
    this.ticketDetalle.set(null);
  }
}
