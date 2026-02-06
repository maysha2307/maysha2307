// ...existing code...
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignatureGalleryService, SignaturePhotos } from '../../services/signature-gallery.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
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

  constructor(private signatureGalleryService: SignatureGalleryService) {}

  ngOnInit(): void {
    this.signatureSub = this.signatureGalleryService.signaturePhotos$.subscribe((photos: SignaturePhotos) => {
      this.mashooqSignatures = photos.mashooq;
      this.aayeshaSignatures = photos.aayesha;
    });
  }

  ngOnDestroy(): void {
    if (this.signatureSub) {
      this.signatureSub.unsubscribe();
    }
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/animations/Book.png'; // fallback image, replace with your own
  }
}
