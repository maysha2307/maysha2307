import { Component, ElementRef, OnInit } from '@angular/core';
import { SignatureService } from '../../services/signature.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  onSignatureBoxClick(event: MouseEvent, who: 'mashooq' | 'aayesha') {
    // Prevent file input trigger if bin button is clicked
    const target = event.target as HTMLElement;
    if (target.closest('.bin-btn')) {
      return;
    }
    this.triggerFileInput(who);
  }
  // Call this method to reset signature to placeholder (for publishing)
  async resetSignature(who: 'mashooq' | 'aayesha') {
    await this.signatureService.deleteSignature(who);
    if (who === 'mashooq') {
      this.sigMashooq = null;
    }
    if (who === 'aayesha') {
      this.sigAayesha = null;
    }
  }
  async removeSignature(who: 'mashooq' | 'aayesha') {
    // Actually delete the row from Supabase for storage saving
    await this.signatureService.deleteSignature(who);
    if (who === 'mashooq') {
      this.sigMashooq = null;
    }
    if (who === 'aayesha') {
      this.sigAayesha = null;
    }
  }
  sigMashooq: string | null = null;
  sigAayesha: string | null = null;
  loadingMashooq = false;
  loadingAayesha = false;
  errorMashooq: string | null = null;
  errorAayesha: string | null = null;
  uploadProgressMashooq: number | null = null;
  uploadTotalMashooq: number | null = null;
  uploadProgressAayesha: number | null = null;
  uploadTotalAayesha: number | null = null;

  constructor(private el: ElementRef, private signatureService: SignatureService) {}

  async ngOnInit(): Promise<void> {
  // Load signatures from Supabase for both users
  this.sigMashooq = await this.signatureService.getSignatureUrl('mashooq');
  this.sigAayesha = await this.signatureService.getSignatureUrl('aayesha');
  }



  // Lottie animation removed to eliminate CommonJS dependency

onFileSelected(event: Event, who: 'mashooq' | 'aayesha') {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    if (who === 'mashooq') {
      this.loadingMashooq = true;
      this.errorMashooq = null;
      this.uploadProgressMashooq = 0;
      this.uploadTotalMashooq = input.files[0].size;
    }
    if (who === 'aayesha') {
      this.loadingAayesha = true;
      this.errorAayesha = null;
      this.uploadProgressAayesha = 0;
      this.uploadTotalAayesha = input.files[0].size;
    }
    this.signatureService.uploadSignature(input.files[0]).subscribe({
      next: async (result) => {
        if (result.progress !== undefined) {
          if (who === 'mashooq') {
            this.uploadProgressMashooq = result.progress;
          }
          if (who === 'aayesha') {
            this.uploadProgressAayesha = result.progress;
          }
        }
        if (result.url) {
          // Save to Supabase
          await this.signatureService.saveSignatureUrl(who, result.url);
          if (who === 'mashooq') {
            this.loadingMashooq = false;
            this.uploadProgressMashooq = null;
            this.uploadTotalMashooq = null;
            this.sigMashooq = result.url;
          }
          if (who === 'aayesha') {
            this.loadingAayesha = false;
            this.uploadProgressAayesha = null;
            this.uploadTotalAayesha = null;
            this.sigAayesha = result.url;
          }
        }
        if (result.error) {
          if (who === 'mashooq') {
            this.loadingMashooq = false;
            this.errorMashooq = 'Upload failed. Try again.';
            this.uploadProgressMashooq = null;
            this.uploadTotalMashooq = null;
          }
          if (who === 'aayesha') {
            this.loadingAayesha = false;
            this.errorAayesha = 'Upload failed. Try again.';
            this.uploadProgressAayesha = null;
            this.uploadTotalAayesha = null;
          }
        }
      }
    });
  }
}
  triggerFileInput(who: 'mashooq' | 'aayesha') {
    const fileInput = this.el.nativeElement.querySelector(`#file-${who}`) as HTMLInputElement;
    fileInput.click();
  }
}
