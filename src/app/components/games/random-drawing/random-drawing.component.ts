import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-random-drawing',
  templateUrl: './random-drawing.component.html',
  styleUrls: ['./random-drawing.component.scss']
})
export class RandomDrawingComponent implements AfterViewInit {
  @Output() close = new EventEmitter<void>();
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  currentPrompt: string | null = null;
  brushColor = '#ff6b8a';
  brushSize = 4;
  timeLeft = 60;
  timerInterval: any = null;
  isTimerRunning = false;

  colors = [
    '#ff6b8a', '#ff9eb5', '#8b5cf6', '#3b82f6', 
    '#10b981', '#f59e0b', '#ffffff', '#000000'
  ];

  brushSizes = [2, 4, 8, 12];

  prompts = [
    // Romantic
    "Draw your partner's smile",
    "Draw your dream date",
    "Draw your first meeting",
    "Draw a love letter",
    "Draw your couple goals",
    "Draw your partner as an animal",
    "Draw your wedding day",
    "Draw your dream home together",
    
    // Fun & Creative
    "Draw a dragon eating pizza",
    "Draw a cat astronaut",
    "Draw your partner as a superhero",
    "Draw yourself as a cartoon",
    "Draw a magical forest",
    "Draw an underwater castle",
    "Draw a flying car",
    "Draw your dream vacation",
    
    // Abstract
    "Draw happiness",
    "Draw music",
    "Draw your favorite memory",
    "Draw the future",
    "Draw a feeling",
    "Draw your dreams",
    
    // Quick Challenges
    "Draw with your eyes closed!",
    "Draw using only circles",
    "Draw using only straight lines",
    "Draw with your non-dominant hand"
  ];

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 300;
    }

    // Set initial styles
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.brushColor;
    this.ctx.lineWidth = this.brushSize;

    // Fill with white background
    this.ctx.fillStyle = '#1a1a25';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  getRandomPrompt(): void {
    const randomIndex = Math.floor(Math.random() * this.prompts.length);
    this.currentPrompt = this.prompts[randomIndex];
    this.clearCanvas();
    this.stopTimer();
    this.timeLeft = 60;
  }

  startTimer(): void {
    if (this.isTimerRunning) return;
    
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
  }

  resetTimer(): void {
    this.stopTimer();
    this.timeLeft = 60;
  }

  // Drawing methods
  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const pos = this.getPosition(event);
    this.lastX = pos.x;
    this.lastY = pos.y;

    // Start timer on first draw
    if (!this.isTimerRunning && this.currentPrompt) {
      this.startTimer();
    }
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;
    event.preventDefault();

    const pos = this.getPosition(event);
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  private getPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    if (event instanceof TouchEvent) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  }

  setColor(color: string): void {
    this.brushColor = color;
    this.ctx.strokeStyle = color;
  }

  setSize(size: number): void {
    this.brushSize = size;
    this.ctx.lineWidth = size;
  }

  clearCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = '#1a1a25';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  saveDrawing(): void {
    const canvas = this.canvasRef.nativeElement;
    const link = document.createElement('a');
    link.download = `our-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  goBack(): void {
    this.stopTimer();
    this.close.emit();
  }
}
