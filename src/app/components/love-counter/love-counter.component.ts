import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-love-counter',
  templateUrl: './love-counter.component.html',
  styleUrls: ['./love-counter.component.scss']
})
export class LoveCounterComponent implements OnInit, OnDestroy {
  // 💕 July 23, 2025 at 9:02 PM - When she said YES!
  startDate = new Date('2025-07-23T21:02:00');

  years = 0;
  months = 0;
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  totalDays = 0;
  totalHeartbeats = 0;

  private timerInterval: any;

  // Floating hearts
  floatingHearts: { id: number; left: number; delay: number; duration: number; size: number }[] = [];

  ngOnInit(): void {
    this.calculateTime();
    this.timerInterval = setInterval(() => this.calculateTime(), 1000);
    this.generateFloatingHearts();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private calculateTime(): void {
    const now = new Date();
    const diff = now.getTime() - this.startDate.getTime();

    // Total days for fun stats
    this.totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Heartbeats (avg 100,000 per day)
    this.totalHeartbeats = this.totalDays * 100000;

    // Calculate years, months, days
    let years = now.getFullYear() - this.startDate.getFullYear();
    let months = now.getMonth() - this.startDate.getMonth();
    let days = now.getDate() - this.startDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    this.years = years;
    this.months = months;
    this.days = days;

    // Time components
    this.hours = now.getHours();
    this.minutes = now.getMinutes();
    this.seconds = now.getSeconds();
  }

  private generateFloatingHearts(): void {
    for (let i = 0; i < 15; i++) {
      this.floatingHearts.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        size: 0.5 + Math.random() * 1
      });
    }
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  get formattedStartDate(): string {
    return this.startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
