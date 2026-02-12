// ...existing code...
import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignatureGalleryService, SignaturePhotos } from '../../services/signature-gallery.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('promiseCard', { static: false }) promiseCard!: ElementRef;
    private intersectionObserver: IntersectionObserver | null = null;

    sprinkleTimeouts: { [key: string]: any } = {};
    sprinkleStates: { [key: string]: boolean } = { mashooq: false, aayesha: false };
    sprinkleHearts(card: 'mashooq' | 'aayesha') {
      this.sprinkleStates[card] = true;
      if (this.sprinkleTimeouts[card]) {
        clearTimeout(this.sprinkleTimeouts[card]);
      }
      this.sprinkleTimeouts[card] = setTimeout(() => {
        this.sprinkleStates[card] = false;
      }, 1200);
    }
  mashooqSignatures: any[] = [];
  aayeshaSignatures: any[] = [];
  private signatureSub: Subscription | null = null;

  constructor(private signatureGalleryService: SignatureGalleryService, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.signatureSub = this.signatureGalleryService.signaturePhotos$.subscribe((photos: SignaturePhotos) => {
      this.mashooqSignatures = photos.mashooq;
      this.aayeshaSignatures = photos.aayesha;
    });
  }

  ngAfterViewInit(): void {
    // trigger reveal when promise card enters viewport
    if (this.promiseCard) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.promiseCard.nativeElement, 'in-view');
            // We can disconnect after reveal to avoid extra triggers
            if (this.intersectionObserver) {
              this.intersectionObserver.disconnect();
              this.intersectionObserver = null;
            }
          }
        });
      }, { threshold: 0.35 });

      this.intersectionObserver.observe(this.promiseCard.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.signatureSub) {
      this.signatureSub.unsubscribe();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/animations/Book.png'; // fallback image, replace with your own
  }
}
