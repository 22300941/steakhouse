export interface Usuario {
  id: number;
  username: string;
  password?: string;
  rol: 'admin' | 'empleado';
  nombre: string;
}
