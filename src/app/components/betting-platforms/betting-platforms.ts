import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BetSelection {
  match: string;
  odds: number;
}

@Component({
  selector: 'app-betting-platforms',
  imports: [CommonModule, FormsModule],
  templateUrl: './betting-platforms.html',
  styleUrl: './betting-platforms.css'
})
export class BettingPlatforms {
  platforms = [
    { name: 'Sportbet', promoCode: 'SPORT2024', color: 'bg-emerald-500', url: 'https://sportbet.example.com' },
    { name: 'Melbet', promoCode: 'MELBETVIP', color: 'bg-yellow-500', url: 'https://melbet.example.com' },
    { name: 'Sportpesa', promoCode: 'PESAWIN', color: 'bg-blue-600', url: 'https://sportpesa.example.com' },
    { name: 'Betpawa', promoCode: 'PAWAMAX', color: 'bg-green-600', url: 'https://betpawa.example.com' },
    { name: 'Paripesa', promoCode: 'PARI100', color: 'bg-blue-400', url: 'https://paripesa.example.com' },
    { name: 'Helabet', promoCode: 'HELABONUS', color: 'bg-purple-600', url: 'https://helabet.example.com' },
    { name: '1xBet', promoCode: '1XSUPER', color: 'bg-blue-800', url: 'https://1xbet.example.com' }
  ];

  selectedAppToOpen = signal<string>('');

  // Accumulator mock state
  accumulatorSelections = signal<BetSelection[]>([
    { match: 'Real Madrid vs Barcelona', odds: 2.1 },
    { match: 'Man City vs Arsenal', odds: 1.8 }
  ]);

  totalOdds = computed(() => {
    return this.accumulatorSelections().reduce((acc, curr) => acc * curr.odds, 1);
  });

  openAccount() {
    const url = this.platforms.find(p => p.name === this.selectedAppToOpen())?.url;
    if (url) {
      window.open(url, '_blank');
    }
  }

  addRandomSelection() {
    const randomOdds = Math.round((Math.random() * 2 + 1.1) * 100) / 100;
    this.accumulatorSelections.update(selections => [
      ...selections,
      { match: 'Random Match ' + (selections.length + 1), odds: randomOdds }
    ]);
  }

  clearAccumulator() {
    this.accumulatorSelections.set([]);
  }
}
