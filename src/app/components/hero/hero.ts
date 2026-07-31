import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  topTeams = [
    { name: 'Real Madrid', vs: 'Barcelona', time: 'Today, 21:00', odds: { 1: 2.1, X: 3.4, 2: 3.1 } },
    { name: 'Manchester City', vs: 'Arsenal', time: 'Today, 18:30', odds: { 1: 1.8, X: 3.6, 2: 4.2 } },
    { name: 'Bayern Munich', vs: 'Dortmund', time: 'Today, 16:30', odds: { 1: 1.5, X: 4.5, 2: 6.0 } }
  ];
}
