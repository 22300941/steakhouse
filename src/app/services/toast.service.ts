import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contadorId = 0;
  toasts = signal<Toast[]>([]);

  mostrar(mensaje: string, tipo: Toast['tipo'] = 'info', duracion = 3000) {
    const id = ++this.contadorId;
    this.toasts.update(lista => [...lista, { id, mensaje, tipo }]);
    setTimeout(() => this.quitar(id), duracion);
  }

  exito(mensaje: string) { this.mostrar(mensaje, 'exito'); }
  error(mensaje: string) { this.mostrar(mensaje, 'error'); }
  info(mensaje: string) { this.mostrar(mensaje, 'info'); }
  advertencia(mensaje: string) { this.mostrar(mensaje, 'advertencia'); }

  quitar(id: number) {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }
}