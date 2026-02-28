import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
      <span class="flex-grow">Parabrisas Cisneros</span>
      <div class="flex items-center gap-4">
        <span class="text-sm">{{ currentUser?.nombres }} {{ currentUser?.apellidos }} ({{ currentUser?.rol }})</span>
        <button mat-button (click)="logout()">
          <mat-icon>logout</mat-icon>
          Cerrar Sesión
        </button>
      </div>
    </mat-toolbar>

    <mat-sidenav-container class="min-h-screen bg-gray-100">
      <mat-sidenav #sidenav class="w-64" mode="side" [opened]="!isMobile">
        <mat-nav-list class="pt-4 px-2">
          <mat-list-item
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            routerLinkActive="active-item"
            class="text-white nav-item"
          >
            <mat-icon matListItemIcon class="text-white">{{ item.icon }}</mat-icon>
            <span matListItemTitle class="text-white">{{ item.label }}</span>
          </mat-list-item>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="content-area">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      mat-sidenav-container {
        height: calc(100vh - 64px);
      }

      .content-area {
        padding: 2rem 2.5rem;
      }

      mat-nav-list {
        padding-top: 1rem;
      }

      mat-list-item {
        height: auto !important;
        padding: 0.5rem 1rem;
        margin-bottom: 0.25rem;
        border-radius: 8px;
      }

      .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }

      .active-item {
        background-color: rgba(255, 255, 255, 0.25) !important;
      }
    `
  ]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  currentUser: any;
  isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  private resizeListener: () => void;
  menuItems = [
    { label: 'Estadísticas', icon: 'bar_chart', route: '/dashboard/estadisticas' },
    { label: 'Catálogo', icon: 'inventory', route: '/dashboard/catalogo' },
    { label: 'Ventas', icon: 'shopping_cart', route: '/dashboard/ventas' },
    { label: 'Compras', icon: 'shopping_bag', route: '/dashboard/compras' },
    { label: 'Proveedores', icon: 'business', route: '/dashboard/proveedores' },
    { label: 'Usuarios', icon: 'people', route: '/dashboard/usuarios' }
  ];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.resizeListener = () => {
      this.isMobile = window.innerWidth < 768;
      this.cdr.detectChanges();
    };
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
