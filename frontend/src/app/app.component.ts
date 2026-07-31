import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ApiService } from "./core/api.service";
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `<div class="announcement">
      Free express delivery on orders over $150
    </div>
    <header>
      <a routerLink="/" class="brand"
        ><span>✦</span>NOVA<span class="accent">CART</span></a
      >
      <nav>
        <a
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Home</a
        ><a routerLink="/products" routerLinkActive="active">Shop</a
        ><a routerLink="/about" routerLinkActive="active">About</a
        ><a routerLink="/contact" routerLinkActive="active">Contact</a>
      </nav>
      <div class="actions">
        @if (api.user()) {
          <span class="hello">Hi, {{ api.user()?.name }}</span
          ><button class="link" (click)="api.logout()">Logout</button>
        } @else {
          <a routerLink="/login">Login</a>
        }
        <a routerLink="/cart" class="cart"
          >Bag <b>{{ api.cartCount() }}</b></a
        >
      </div>
    </header>
    <main><router-outlet /></main>
    <footer>
      <div>
        <a class="brand" routerLink="/">✦ NOVACART</a>
        <p>Designed for better everyday moments.</p>
      </div>
      <div>
        <b>Discover</b><a routerLink="/products">Products</a
        ><a routerLink="/about">Our story</a>
      </div>
      <div>
        <b>Help</b><a routerLink="/contact">Contact</a
        ><a routerLink="/cart">Your bag</a>
      </div>
      <small>© 2026 NovaCart.</small>
    </footer>`,
})
export class AppComponent {
  api = inject(ApiService);
  constructor() {
    this.api.loadCart();
  }
}
