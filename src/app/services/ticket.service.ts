import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/tickets';

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  crear(ticket: Omit<Ticket, 'id'>): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }
}
