import { Component } from '@angular/core';

interface GameCard {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {
  activeGame: string | null = null;

  games: GameCard[] = [
    {
      id: 'we-know-us',
      name: 'We Know Us',
      emoji: '🤝',
      description: 'Ask questions, test your bond',
      color: '#ff6b8a'
    },
    {
      id: 'random-drawing',
      name: 'Random Drawing',
      emoji: '🎨',
      description: 'Draw something creative together',
      color: '#8b5cf6'
    }
  ];

  openGame(gameId: string): void {
    this.activeGame = gameId;
  }

  closeGame(): void {
    this.activeGame = null;
  }
}
