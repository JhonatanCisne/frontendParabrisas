import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class App implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Verificar si la sesión guardada sigue siendo válida
    this.authService.checkSession();
  }
}
