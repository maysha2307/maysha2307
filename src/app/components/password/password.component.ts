import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements AfterViewInit, OnDestroy {
  password = '';
  private correctPassword = 'm';

  // UI state
  fadeOutIntro = false;
  showCard = false;
  fadeOutCard = false; // Restored
  wrongPassword = false;
  showLove = false; // Restored
  fadeOutBackground = false;

  private bookAnim!: AnimationItem;
  private pencilAnim!: AnimationItem;
  private loveAnim!: AnimationItem; // Restored

  constructor(private router: Router) {}

  ngAfterViewInit() {
    // Load intro animations
    const bookContainer = document.getElementById('book-animation');
    const pencilContainer = document.getElementById('pencil-animation');

    if (bookContainer) {
      this.bookAnim = lottie.loadAnimation({
        container: bookContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/animations/Book.json'
      });
      this.bookAnim.setSpeed(0.6);
    }

    if (pencilContainer) {
      this.pencilAnim = lottie.loadAnimation({
        container: pencilContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/animations/pencil.json'
      });
    }

    // Sequence: Intro → fade → card
    setTimeout(() => {
      this.fadeOutIntro = true;
      setTimeout(() => {
        this.showCard = true;
      }, 1500); // This should match the opacity transition in SCSS
    }, 4000); // Increased from 3000ms
  }

  unlock() {
    if (this.password.trim() === this.correctPassword) {
      this.fadeOutCard = true;
      setTimeout(() => {
        this.showCard = false;
        this.showLove = true;
        // Fade out pink background while love animation plays
        this.fadeOutBackground = true;
        setTimeout(() => {
          const loveContainer = document.getElementById('love-animation');
          if (loveContainer) {
            this.loveAnim = lottie.loadAnimation({
              container: loveContainer,
              renderer: 'svg',
              loop: false,
              autoplay: true,
              path: 'assets/animations/Love.json'
            });
            // Navigate quickly after animation starts (e.g. 900ms)
            setTimeout(() => {
              localStorage.setItem('unlocked', 'true');
              this.showLove = false; // Remove heart
              this.router.navigate(['/app/home']);
            }, 900);
          } else {
            localStorage.setItem('unlocked', 'true');
            this.router.navigate(['/app/home']);
          }
        });
      }, 800);
    } else {
      this.wrongPassword = true;
      setTimeout(() => (this.wrongPassword = false), 1500);
    }
  }

  ngOnDestroy() {
    if (this.bookAnim) this.bookAnim.destroy();
    if (this.pencilAnim) this.pencilAnim.destroy();
    if (this.loveAnim) this.loveAnim.destroy();
  }
}
