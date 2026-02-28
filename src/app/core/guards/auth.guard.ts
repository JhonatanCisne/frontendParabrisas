import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      const requiredRoles = route.data['roles'] as string[] | undefined;
      if (requiredRoles && requiredRoles.length > 0 && !this.authService.hasRole(requiredRoles)) {
        this.router.navigate(['/dashboard/catalogo']);
        return false;
      }
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
