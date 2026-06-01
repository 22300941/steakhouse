import { Routes } from '@angular/router';
import { authGuard, adminGuard, empleadoGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent) },
  { path: 'terminos', loadComponent: () => import('./components/terminos/terminos.component').then(m => m.TerminosComponent) },
  { path: 'aviso-privacidad', loadComponent: () => import('./components/aviso-privacidad/aviso-privacidad.component').then(m => m.AvisoPrivacidadComponent) },
  { path: 'inicio', loadComponent: () => import('./components/inicio/inicio.component').then(m => m.InicioComponent), canActivate: [authGuard, empleadoGuard] },
  { path: 'inventario', loadComponent: () => import('./components/inventario/inventario.component').then(m => m.InventarioComponent), canActivate: [authGuard, adminGuard] },
  { path: 'menu', loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent), canActivate: [authGuard, empleadoGuard] },
  { path: 'carrito', loadComponent: () => import('./components/carrito/carrito.component').then(m => m.CarritoComponent), canActivate: [authGuard, empleadoGuard] },
  { path: 'perfil', loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent), canActivate: [authGuard, empleadoGuard] },
  { path: 'historial', loadComponent: () => import('./components/historial/historial.component').then(m => m.HistorialComponent), canActivate: [authGuard, empleadoGuard] },
  { path: 'recuperar-password', loadComponent: () => import('./components/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent) },
  { path: '**', redirectTo: 'login' }
];