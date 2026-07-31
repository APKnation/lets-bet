import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-vip-room',
  imports: [DecimalPipe],
  templateUrl: './vip-room.html',
  styleUrl: './vip-room.css'
})
export class VipRoom {
  winRate = 87; // percentage
  liveTips = [
    { time: '10 mins ago', match: 'Liverpool vs Chelsea', prediction: 'Over 2.5 Goals', odds: 1.85, status: 'pending' },
    { time: '1 hour ago', match: 'Juventus vs AC Milan', prediction: 'Home Win', odds: 2.10, status: 'won' },
    { time: '3 hours ago', match: 'PSG vs Lyon', prediction: 'Both Teams to Score', odds: 1.65, status: 'won' }
  ];
}
