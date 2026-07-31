import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-payments',
  imports: [],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments {
  paymentMethods = [
    { name: 'M-Pesa', color: 'bg-green-500' },
    { name: 'Airtel Money', color: 'bg-red-500' },
    { name: 'Halotel (HaloPesa)', color: 'bg-orange-500' }
  ];
  
  transactionType = signal<'deposit' | 'withdraw'>('deposit');

  setTransactionType(type: 'deposit' | 'withdraw') {
    this.transactionType.set(type);
  }
}
