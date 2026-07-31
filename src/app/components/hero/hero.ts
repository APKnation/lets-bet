import { Component, signal, computed } from '@angular/core';

interface Match {
  name: string;
  vs: string;
  time: string;
  league: string;
  odds: { 1: number; X: number; 2: number };
}

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  leagues = ['All', 'EPL', 'La Liga', 'Serie A', 'Ligue 1', 'Bundesliga'];
  selectedLeague = signal<string>('All');

  allMatches: Match[] = [
    { name: 'Real Madrid', vs: 'Barcelona', time: 'Today, 21:00', league: 'La Liga', odds: { 1: 2.1, X: 3.4, 2: 3.1 } },
    { name: 'Manchester City', vs: 'Arsenal', time: 'Today, 18:30', league: 'EPL', odds: { 1: 1.8, X: 3.6, 2: 4.2 } },
    { name: 'Bayern Munich', vs: 'Dortmund', time: 'Today, 16:30', league: 'Bundesliga', odds: { 1: 1.5, X: 4.5, 2: 6.0 } },
    { name: 'Juventus', vs: 'AC Milan', time: 'Today, 20:45', league: 'Serie A', odds: { 1: 2.4, X: 3.1, 2: 2.9 } },
    { name: 'PSG', vs: 'Marseille', time: 'Tomorrow, 21:00', league: 'Ligue 1', odds: { 1: 1.4, X: 4.8, 2: 7.5 } },
    { name: 'Liverpool', vs: 'Chelsea', time: 'Tomorrow, 17:30', league: 'EPL', odds: { 1: 2.0, X: 3.5, 2: 3.6 } },
  ];

  filteredMatches = computed(() => {
    const currentLeague = this.selectedLeague();
    if (currentLeague === 'All') {
      return this.allMatches;
    }
    return this.allMatches.filter(m => m.league === currentLeague);
  });

  selectLeague(league: string) {
    this.selectedLeague.set(league);
  }
}
