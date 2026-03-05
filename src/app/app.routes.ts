import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardLayoutComponent } from './shared/components/dashboard-layout.component';
import { CatalogoComponent } from './features/productos/catalogo.component';
import { VentasComponent } from './features/ventas/ventas.component';
import { ComprasComponent } from './features/compras/compras.component';
import { ProveedoresComponent } from './features/proveedores/proveedores.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { EstadisticasComponent } from './features/estadisticas/estadisticas.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'estadisticas', pathMatch: 'full' },
      { path: 'estadisticas', component: EstadisticasComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'catalogo', component: CatalogoComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'compras', component: ComprasComponent },
      { path: 'proveedores', component: ProveedoresComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
