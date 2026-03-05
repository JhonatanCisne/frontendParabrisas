import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatListModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="dashboard-container" [hasBackdrop]="isMobile">
      <mat-sidenav
        #sidenav
        class="sidebar-drawer"
        [mode]="isMobile ? 'over' : 'side'"
        [opened]="!isMobile"
        [fixedInViewport]="isMobile"
        [fixedTopGap]="isMobile ? 56 : 0"
      >
        <!-- Sidebar Header / Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <mat-icon>directions_car</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-name">Parabrisas</span>
            <span class="brand-sub">Cisneros</span>
          </div>
        </div>

        <!-- Navigation -->
        <mat-nav-list class="sidebar-nav">
          <a
            mat-list-item
            *ngFor="let item of filteredMenuItems"
            [routerLink]="item.route"
            routerLinkActive="active-item"
            class="nav-item"
            (click)="maybeCloseSidenav(sidenav)"
          >
            <mat-icon matListItemIcon class="nav-icon">{{ item.icon }}</mat-icon>
            <span matListItemTitle class="nav-label">{{ item.label }}</span>
          </a>
        </mat-nav-list>

        <!-- Sidebar Footer / User -->
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              {{ (currentUser?.nombres || 'U').charAt(0) }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.nombres }} {{ currentUser?.apellidos }}</span>
              <span class="user-role">{{ currentUser?.rol }}</span>
            </div>
          </div>
          <button mat-icon-button (click)="logout()" class="logout-btn" matTooltip="Cerrar sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="content-area">
        <!-- Top Bar -->
        <div class="topbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-btn" aria-label="Abrir menú">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="topbar-spacer"></div>
        </div>

        <!-- Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
      }

      /* ---- Sidebar ---- */
      mat-sidenav {
        background: #0f172a !important;
        border-right: none !important;
        display: flex;
        flex-direction: column;
        width: 260px;
      }

      .sidebar-drawer {
        max-width: 320px;
      }

      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 20px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .brand-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .brand-icon mat-icon {
        color: white;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }

      .brand-name {
        font-size: 16px;
        font-weight: 700;
        color: #f1f5f9;
        letter-spacing: -0.01em;
      }

      .brand-sub {
        font-size: 12px;
        font-weight: 400;
        color: #64748b;
      }

      /* ---- Navigation ---- */
      .sidebar-nav {
        flex: 1;
        padding: 12px 10px !important;
        overflow-y: auto;
      }

      .nav-item {
        border-radius: 8px !important;
        margin-bottom: 2px !important;
        height: 44px !important;
        transition: all 0.15s ease !important;
      }

      .nav-icon {
        color: #64748b !important;
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
        margin-right: 12px;
        transition: color 0.15s ease;
      }

      .nav-label {
        color: #94a3b8 !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        transition: color 0.15s ease;
      }

      .nav-item:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
      }

      .nav-item:hover .nav-icon {
        color: #cbd5e1 !important;
      }

      .nav-item:hover .nav-label {
        color: #e2e8f0 !important;
      }

      .active-item {
        background-color: rgba(59, 130, 246, 0.12) !important;
      }

      .active-item .nav-icon {
        color: #3b82f6 !important;
      }

      .active-item .nav-label {
        color: #f1f5f9 !important;
        font-weight: 600 !important;
      }

      /* ---- Sidebar Footer ---- */
      .sidebar-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.15);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        overflow: hidden;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .user-details {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
        overflow: hidden;
      }

      .user-name {
        font-size: 13px;
        font-weight: 500;
        color: #e2e8f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .logout-btn {
        color: #64748b !important;
        transition: color 0.15s ease;
      }

      .logout-btn:hover {
        color: #ef4444 !important;
      }

      /* ---- Top Bar ---- */
      .topbar {
        display: flex;
        align-items: center;
        height: 56px;
        padding: 0 24px;
        background: #ffffff;
        border-bottom: 1px solid #e2e8f0;
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .menu-btn {
        color: #475569 !important;
        margin-right: 12px;
      }

      .topbar-spacer {
        flex: 1;
      }

      /* ---- Content ---- */
      .content-area {
        background-color: #f8fafc !important;
      }

      .page-content {
        padding: 28px 32px;
        max-width: 1440px;
      }

      @media (max-width: 1024px) {
        .page-content {
          padding: 24px;
        }
      }

      @media (max-width: 767px) {
        .dashboard-container {
          min-height: 100vh;
        }

        mat-sidenav {
          width: 80vw;
          max-width: 320px;
        }

        .sidebar-footer {
          flex-wrap: wrap;
        }

        .topbar {
          padding: 0 16px;
        }

        .menu-btn {
          display: inline-flex;
        }

        .content-area {
          padding-bottom: 40px;
        }

        .page-content {
          padding: 20px 16px;
        }
      }

      @media (min-width: 768px) {
        .menu-btn {
          display: none;
        }
      }
    `
  ]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  currentUser: any;
  isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  private resizeListener: () => void;
  filteredMenuItems: Array<{ label: string; icon: string; route: string; roles?: string[] }> = [];
  menuItems = [
    { label: 'Estadísticas', icon: 'bar_chart', route: '/dashboard/estadisticas', roles: ['ADMIN'] },
    { label: 'Catálogo', icon: 'inventory', route: '/dashboard/catalogo' },
    { label: 'Ventas', icon: 'shopping_cart', route: '/dashboard/ventas' },
    { label: 'Compras', icon: 'shopping_bag', route: '/dashboard/compras' },
    { label: 'Proveedores', icon: 'business', route: '/dashboard/proveedores', roles: ['ADMIN'] },
    { label: 'Usuarios', icon: 'people', route: '/dashboard/usuarios', roles: ['ADMIN'] }
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
    this.filteredMenuItems = this.menuItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return this.authService.hasRole(item.roles);
    });
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  maybeCloseSidenav(drawer: MatSidenav): void {
    if (this.isMobile) {
      drawer.close();
    }
  }
}
