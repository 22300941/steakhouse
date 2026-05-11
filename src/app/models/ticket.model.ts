export interface Ticket {
  id: number;
  fecha: string;
  responsable: string;
  cantidad: number;
  items?: TicketItem[];
}

export interface TicketItem {
  producto: string;
  cantidad: number;
  precio_unitario: number;
  total_linea: number;
}
