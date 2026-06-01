import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estaAutenticado) return true;
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estaAutenticado && auth.esAdmin) return true;
  router.navigate(['/inicio']);
  return false;
};

export const empleadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estaAutenticado && !auth.esAdmin) return true;
  if (auth.estaAutenticado && auth.esAdmin) {
    router.navigate(['/inventario']);
    return false;
  }
  router.navigate(['/login']);
  return false;
};