export interface HistorialItem {
  id: number;
  historial_id: number;
  producto_nombre: string;
  producto_precio: number;
  cantidad: number;
  total_linea: number;
}

export interface Historial {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  fecha: string;
  total: number;
  xml_ticket?: string;
  items?: HistorialItem[];
}