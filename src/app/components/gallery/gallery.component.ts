import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { GalleryPhoto } from '../../models/gallery-photo.model';
import { GalleryService } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  photos$: Observable<GalleryPhoto[]>;
  selectedPhotoIndex: number | null = null;
  
  // Comments
  comments: { [photoId: string]: string } = {};
  showCommentForm: { [photoId: string]: boolean } = {};
  commentText: { [photoId: string]: string } = {};

  constructor(private galleryService: GalleryService) {
    this.photos$ = this.galleryService.photos$;
    this.loadComments();
  }

  ngOnInit(): void {
    // Gallery loads all photos in grid - no autoplay needed
  }

  ngOnDestroy(): void {
    this.selectedPhotoIndex = null;
  }

  trackById(index: number, photo: GalleryPhoto): string {
    return photo.id;
  }

  // Modal Functions
  openPhotoModal(index: number): void {
    this.selectedPhotoIndex = index;
    document.body.style.overflow = 'hidden';
  }

  closePhotoModal(): void {
    this.selectedPhotoIndex = null;
    document.body.style.overflow = 'auto';
    this.showCommentForm = {};
  }

  nextPhoto(totalPhotos: number): void {
    if (this.selectedPhotoIndex !== null) {
      this.selectedPhotoIndex = (this.selectedPhotoIndex + 1) % totalPhotos;
    }
  }

  prevPhoto(totalPhotos: number): void {
    if (this.selectedPhotoIndex !== null) {
      this.selectedPhotoIndex = (this.selectedPhotoIndex - 1 + totalPhotos) % totalPhotos;
    }
  }

  // Keyboard navigation
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.selectedPhotoIndex === null) return;

    if (event.key === 'Escape') {
      this.closePhotoModal();
    }
  }

  // Comments functionality
  private loadComments(): void {
    const saved = localStorage.getItem('gallery_comments');
    if (saved) {
      try {
        this.comments = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  }

  private saveComments(): void {
    localStorage.setItem('gallery_comments', JSON.stringify(this.comments));
  }

  toggleCommentForm(photoId: string): void {
    this.showCommentForm[photoId] = !this.showCommentForm[photoId];
    if (!this.commentText[photoId]) {
      this.commentText[photoId] = this.comments[photoId] || '';
    }
  }

  saveComment(photoId: string): void {
    if (this.commentText[photoId]?.trim()) {
      this.comments[photoId] = this.commentText[photoId].trim();
      this.saveComments();
      this.showCommentForm[photoId] = false;
    }
  }

  deleteComment(photoId: string): void {
    delete this.comments[photoId];
    this.saveComments();
    this.showCommentForm[photoId] = false;
  }

  hasComment(photoId: string): boolean {
    return !!this.comments[photoId];
  }

  getComment(photoId: string): string {
    return this.comments[photoId] || '';
  }
}
