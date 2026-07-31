import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { AuthModal } from './components/auth-modal/auth-modal';
import { Hero } from './components/hero/hero';
import { VipRoom } from './components/vip-room/vip-room';
import { BettingPlatforms } from './components/betting-platforms/betting-platforms';
import { Payments } from './components/payments/payments';
import { Services } from './components/services/services';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    Header, 
    AuthModal, 
    Hero, 
    VipRoom, 
    BettingPlatforms, 
    Payments, 
    Services, 
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('betting');
  isAuthModalOpen = signal(false);

  toggleAuthModal() {
    this.isAuthModalOpen.set(!this.isAuthModalOpen());
  }
}
