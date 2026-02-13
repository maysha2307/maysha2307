import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements AfterViewInit, OnDestroy {
  password = '';
  // password is now verified server-side via Netlify function
  loading = false;

  // UI state
  showSwordSlash = true; // New: show sword slash animation first
  swordSlashComplete = false;
  fadeOutIntro = false;
  showCard = false;
  fadeOutCard = false;
  wrongPassword = false;
  showLove = false;
  fadeOutBackground = false;
  animationsLoaded = false;

  private bookAnim!: AnimationItem;
  private pencilAnim!: AnimationItem;
  private loveAnim!: AnimationItem;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Start with sword slash animation, then load intro animations
    this.startSwordSlashAnimation();
  }

  private startSwordSlashAnimation() {
    // Sword slash animation lasts 2.5 seconds
    setTimeout(() => {
      this.swordSlashComplete = true;
      this.cdr.detectChanges();
      
      // Fade out sword slash overlay
      setTimeout(() => {
        this.showSwordSlash = false;
        this.cdr.detectChanges();
        
        // Now load the intro animations
        this.loadIntroAnimations();
      }, 500); // Wait for fade out
    }, 2500); // Sword animation duration
  }

  private loadIntroAnimations() {
    const bookContainer = document.getElementById('book-animation');
    const pencilContainer = document.getElementById('pencil-animation');

    let bookLoaded = false;
    let pencilLoaded = !pencilContainer; // If no pencil container, mark as loaded

    const checkAllLoaded = () => {
      if (bookLoaded && pencilLoaded && !this.animationsLoaded) {
        this.animationsLoaded = true;
        this.cdr.detectChanges();
        // Start the intro sequence after animations are loaded
        this.startIntroSequence();
      }
    };

    if (bookContainer) {
      this.bookAnim = lottie.loadAnimation({
        container: bookContainer,
        renderer: 'svg',
        loop: true,
        autoplay: false, // Don't autoplay until loaded
        path: 'assets/animations/Book.json'
      });
      this.bookAnim.setSpeed(0.6);
      
      // Wait for animation data to load
      this.bookAnim.addEventListener('DOMLoaded', () => {
        bookLoaded = true;
        this.bookAnim.play(); // Now play
        checkAllLoaded();
      });

      // Fallback in case DOMLoaded doesn't fire
      setTimeout(() => {
        if (!bookLoaded) {
          bookLoaded = true;
          this.bookAnim?.play();
          checkAllLoaded();
        }
      }, 1500);
    } else {
      bookLoaded = true;
      checkAllLoaded();
    }

    if (pencilContainer) {
      this.pencilAnim = lottie.loadAnimation({
        container: pencilContainer,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'assets/animations/pencil.json'
      });
      
      this.pencilAnim.addEventListener('DOMLoaded', () => {
        pencilLoaded = true;
        this.pencilAnim.play();
        checkAllLoaded();
      });

      setTimeout(() => {
        if (!pencilLoaded) {
          pencilLoaded = true;
          this.pencilAnim?.play();
          checkAllLoaded();
        }
      }, 1500);
    }
  }

  private startIntroSequence() {
    // Show intro for 3.5 seconds after animations are confirmed loaded (reduced from 4.5s)
    setTimeout(() => {
      this.fadeOutIntro = true;
      this.cdr.detectChanges();
      
      // Wait for fade out animation (1.5s in SCSS) then show card
      setTimeout(() => {
        this.showCard = true;
        this.cdr.detectChanges();
      }, 1500);
    }, 3500);
  }

  async unlock() {
    this.loading = true;
    this.cdr.detectChanges();

    try {
      const res = await fetch('/.netlify/functions/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: this.password.trim() })
      });

      if (res.ok) {
        // Trigger the same success UX as before
        this.fadeOutCard = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.showCard = false;
          this.showLove = true;
          this.fadeOutBackground = true;
          this.cdr.detectChanges();

          // Wait for DOM to update, then load Lottie
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

              // Slower speed for smooth elegance
              this.loveAnim.setSpeed(0.8);

              // Navigate immediately when animation completes
              this.loveAnim.addEventListener('complete', () => {
                this.showLove = false;
                this.cdr.detectChanges();
                this.router.navigate(['/app/home']);
              });

              // Fallback only if complete event fails
              setTimeout(() => {
                if (this.showLove) {
                  this.showLove = false;
                  this.cdr.detectChanges();
                  this.router.navigate(['/app/home']);
                }
              }, 3000);
            } else {
              sessionStorage.setItem('unlocked', 'true');
              this.router.navigate(['/app/home']);
            }
          }, 150);
        }, 600);
      } else {
        // wrong password
        this.wrongPassword = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.wrongPassword = false;
          this.cdr.detectChanges();
        }, 1500);
      }
    } catch (err) {
      console.error('Unlock failed', err);
      this.wrongPassword = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.wrongPassword = false;
        this.cdr.detectChanges();
      }, 1500);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.bookAnim) this.bookAnim.destroy();
    if (this.pencilAnim) this.pencilAnim.destroy();
    if (this.loveAnim) this.loveAnim.destroy();
  }
}
