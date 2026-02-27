import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  template: `
    <mat-toolbar color="primary" class="shadow-md">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="flex-grow">Parabrisas Cisneros - Sistema de Gestión</span>
      <div class="flex items-center gap-4">
        <span class="text-sm">{{ currentUser?.nombres }} {{ currentUser?.apellidos }} ({{ currentUser?.rol }})</span>
        <button mat-button (click)="logout()">
          <mat-icon>logout</mat-icon>
          Cerrar Sesión
        </button>
      </div>
    </mat-toolbar>

    <mat-sidenav-container class="min-h-screen bg-gray-100">
      <mat-sidenav #sidenav class="w-64 bg-gray-800" mode="side" [opened]="!isMobile">
        <mat-nav-list class="pt-4">
          <mat-list-item
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            routerLinkActive="bg-blue-600"
            class="text-white hover:bg-gray-700"
          >
            <mat-icon matListItemIcon class="text-white">{{ item.icon }}</mat-icon>
            <span matListItemTitle class="text-white">{{ item.label }}</span>
          </mat-list-item>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="p-6">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      mat-sidenav-container {
        height: calc(100vh - 64px);
      }

      mat-nav-list {
        padding-top: 1rem;
      }

      mat-list-item {
        height: auto !important;
        padding: 0.5rem 1rem;
      }

      .bg-blue-600 {
        background-color: #2563eb;
      }

      .hover\\:bg-gray-700:hover {
        background-color: #374151;
      }
    `
  ]
})
export class DashboardLayoutComponent implements OnInit {
  currentUser: any;
  isMobile = false;
  menuItems = [
    { label: 'Catálogo', icon: 'inventory', route: '/dashboard/catalogo' },
    { label: 'Ventas', icon: 'shopping_cart', route: '/dashboard/ventas' },
    { label: 'Compras', icon: 'shopping_bag', route: '/dashboard/compras' },
    { label: 'Proveedores', icon: 'business', route: '/dashboard/proveedores' },
    { label: 'Usuarios', icon: 'people', route: '/dashboard/usuarios' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
