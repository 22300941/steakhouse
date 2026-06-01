export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'empleado';
  foto?: string;
  vigente?: number;
  fecha_modificacion?: string;
}