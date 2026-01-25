import { Component, EventEmitter, Output } from '@angular/core';

interface Question {
  id: number;
  text: string;
  category: 'fun' | 'deep' | 'memories' | 'future';
}

@Component({
  selector: 'app-we-know-us',
  templateUrl: './we-know-us.component.html',
  styleUrls: ['./we-know-us.component.scss']
})
export class WeKnowUsComponent {
  @Output() close = new EventEmitter<void>();

  currentQuestion: Question | null = null;
  usedQuestionIds: Set<number> = new Set();
  currentPlayer: 'player1' | 'player2' = 'player1';
  player1Name = 'Mashooq';
  player2Name = 'Aayesha';
  showAnswer = false;
  customQuestion = '';
  showCustomInput = false;

  categories = [
    { id: 'fun', name: 'Fun', emoji: '😄' },
    { id: 'deep', name: 'Deep', emoji: '💭' },
    { id: 'memories', name: 'Memories', emoji: '📸' },
    { id: 'future', name: 'Future', emoji: '✨' }
  ];

  selectedCategory: string = 'all';

  questions: Question[] = [
    // Fun Questions
    { id: 1, text: "What's my go-to comfort food?", category: 'fun' },
    { id: 2, text: "What song would I play on repeat?", category: 'fun' },
    { id: 3, text: "What's my weirdest habit?", category: 'fun' },
    { id: 4, text: "What movie can I watch 100 times?", category: 'fun' },
    { id: 5, text: "What's my dream vacation spot?", category: 'fun' },
    { id: 6, text: "What makes me laugh the hardest?", category: 'fun' },
    { id: 7, text: "What's my guilty pleasure?", category: 'fun' },
    { id: 8, text: "What do I do when I'm bored?", category: 'fun' },
    
    // Deep Questions
    { id: 9, text: "What's my biggest fear?", category: 'deep' },
    { id: 10, text: "What makes me feel most loved?", category: 'deep' },
    { id: 11, text: "What's my love language?", category: 'deep' },
    { id: 12, text: "What do I value most in our relationship?", category: 'deep' },
    { id: 13, text: "What's something I've never told anyone?", category: 'deep' },
    { id: 14, text: "When do I feel most vulnerable?", category: 'deep' },
    { id: 15, text: "What's my biggest insecurity?", category: 'deep' },
    { id: 16, text: "What do I need when I'm upset?", category: 'deep' },
    
    // Memory Questions
    { id: 17, text: "What was I wearing when we first met?", category: 'memories' },
    { id: 18, text: "What was our first date?", category: 'memories' },
    { id: 19, text: "What's my favorite memory of us?", category: 'memories' },
    { id: 20, text: "When did you first realize you loved me?", category: 'memories' },
    { id: 21, text: "What's the funniest thing that happened to us?", category: 'memories' },
    { id: 22, text: "What was our biggest fight about?", category: 'memories' },
    { id: 23, text: "What's a small moment you'll never forget?", category: 'memories' },
    { id: 24, text: "What did I say that made you fall for me?", category: 'memories' },
    
    // Future Questions
    { id: 25, text: "Where do I see us in 5 years?", category: 'future' },
    { id: 26, text: "What's my dream home like?", category: 'future' },
    { id: 27, text: "How many kids do I want?", category: 'future' },
    { id: 28, text: "What's on my bucket list?", category: 'future' },
    { id: 29, text: "What career dream do I have?", category: 'future' },
    { id: 30, text: "What's one thing I want us to do together?", category: 'future' }
  ];

  get currentPlayerName(): string {
    return this.currentPlayer === 'player1' ? this.player1Name : this.player2Name;
  }

  get answeringPlayerName(): string {
    return this.currentPlayer === 'player1' ? this.player2Name : this.player1Name;
  }

  selectCategory(catId: string): void {
    this.selectedCategory = catId;
  }

  getRandomQuestion(): void {
    let availableQuestions = this.questions.filter(q => !this.usedQuestionIds.has(q.id));
    
    if (this.selectedCategory !== 'all') {
      availableQuestions = availableQuestions.filter(q => q.category === this.selectedCategory);
    }

    if (availableQuestions.length === 0) {
      // Reset if all questions used
      this.usedQuestionIds.clear();
      availableQuestions = this.selectedCategory === 'all' 
        ? this.questions 
        : this.questions.filter(q => q.category === this.selectedCategory);
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    this.currentQuestion = availableQuestions[randomIndex];
    this.usedQuestionIds.add(this.currentQuestion.id);
    this.showAnswer = false;
  }

  revealAnswer(): void {
    this.showAnswer = true;
  }

  nextTurn(): void {
    this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
    this.currentQuestion = null;
    this.showAnswer = false;
  }

  askCustomQuestion(): void {
    if (this.customQuestion.trim()) {
      this.currentQuestion = {
        id: -1,
        text: this.customQuestion,
        category: 'fun'
      };
      this.customQuestion = '';
      this.showCustomInput = false;
      this.showAnswer = false;
    }
  }

  toggleCustomInput(): void {
    this.showCustomInput = !this.showCustomInput;
  }

  goBack(): void {
    this.close.emit();
  }
}
