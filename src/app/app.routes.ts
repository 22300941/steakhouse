import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'inicio',
    loadComponent: () => import('./components/inicio/inicio.component').then(m => m.InicioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'compra',
    loadComponent: () => import('./components/compra/compra.component').then(m => m.CompraComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'inventario',
    loadComponent: () => import('./components/inventario/inventario.component').then(m => m.InventarioComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'menu',
    loadComponent: () => import('./components/menu/menu.component').then(m => m.MenuComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ganancias',
    loadComponent: () => import('./components/ganancias/ganancias.component').then(m => m.GananciasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'carrito',
    loadComponent: () => import('./components/carrito/carrito.component').then(m => m.CarritoComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
