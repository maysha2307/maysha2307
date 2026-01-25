import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { GalleryPhoto } from '../../models/gallery-photo.model';
import { GalleryService, FolderPhotos } from '../../services/gallery.service';

interface Folder {
  id: string;
  supabaseFolder: string; // Maps to Supabase folder path
  name: string;
  emoji: string;
  photos: GalleryPhoto[];
  currentIndex: number;
  isTransitioning: boolean;
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  // Folders mapped to Supabase storage folders
  folders: Folder[] = [
    { id: 'precious', supabaseFolder: 'gallery/precious', name: 'Precious Us', emoji: '💕', photos: [], currentIndex: 0, isTransitioning: false },
    { id: 'assthetic', supabaseFolder: 'gallery/assthetic', name: 'Assthetic Us', emoji: '✨', photos: [], currentIndex: 0, isTransitioning: false },
    { id: 'autistic', supabaseFolder: 'gallery/autistic', name: 'Autistic Us', emoji: '🤪', photos: [], currentIndex: 0, isTransitioning: false }
  ];
  
  // Modal state
  selectedFolder: Folder | null = null;
  selectedPhotoIndex: number = 0;
  
  // Auto slideshow
  private slideshowSubscriptions: Subscription[] = [];
  private folderSubscription: Subscription | null = null;
  private readonly SLIDE_INTERVAL = 3000; // 3 seconds

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    // Subscribe to folder photos from service
    this.folderSubscription = this.galleryService.folderPhotos$.subscribe(folderPhotos => {
      this.assignPhotosToFolders(folderPhotos);
      this.startAllSlideshows();
    });
  }

  ngOnDestroy(): void {
    this.stopAllSlideshows();
    if (this.folderSubscription) {
      this.folderSubscription.unsubscribe();
    }
    this.selectedFolder = null;
  }

  /**
   * Assign photos from Supabase folders to UI folders
   */
  private assignPhotosToFolders(folderPhotos: FolderPhotos): void {
    // Map each folder to its Supabase photos
    this.folders[0].photos = folderPhotos.precious || [];
    this.folders[1].photos = folderPhotos.assthetic || [];
    this.folders[2].photos = folderPhotos.autistic || [];

    // Reset current index if needed
    this.folders.forEach(folder => {
      if (folder.currentIndex >= folder.photos.length) {
        folder.currentIndex = 0;
      }
    });

    console.log('📁 Folders updated:', {
      precious: this.folders[0].photos.length,
      assthetic: this.folders[1].photos.length,
      autistic: this.folders[2].photos.length
    });
  }

  // Slideshow Controls
  private startAllSlideshows(): void {
    this.stopAllSlideshows();
    
    this.folders.forEach((folder, folderIndex) => {
      if (folder.photos.length > 1) {
        // Stagger start times for visual variety
        const sub = interval(this.SLIDE_INTERVAL + (folderIndex * 500)).subscribe(() => {
          this.nextSlide(folder);
        });
        this.slideshowSubscriptions.push(sub);
      }
    });
  }

  private stopAllSlideshows(): void {
    this.slideshowSubscriptions.forEach(sub => sub.unsubscribe());
    this.slideshowSubscriptions = [];
  }

  private nextSlide(folder: Folder): void {
    if (folder.photos.length <= 1) return;
    
    folder.isTransitioning = true;
    setTimeout(() => {
      folder.currentIndex = (folder.currentIndex + 1) % folder.photos.length;
      folder.isTransitioning = false;
    }, 500);
  }

  getCurrentPhoto(folder: Folder): GalleryPhoto | null {
    if (folder.photos.length === 0) return null;
    return folder.photos[folder.currentIndex];
  }

  getNextPhoto(folder: Folder): GalleryPhoto | null {
    if (folder.photos.length <= 1) return null;
    const nextIndex = (folder.currentIndex + 1) % folder.photos.length;
    return folder.photos[nextIndex];
  }

  // Modal Functions
  openFolder(folder: Folder): void {
    if (folder.photos.length === 0) return;
    this.selectedFolder = folder;
    this.selectedPhotoIndex = 0;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selectedFolder = null;
    this.selectedPhotoIndex = 0;
    document.body.style.overflow = 'auto';
  }

  nextPhoto(): void {
    if (this.selectedFolder && this.selectedFolder.photos.length > 1) {
      this.selectedPhotoIndex = (this.selectedPhotoIndex + 1) % this.selectedFolder.photos.length;
    }
  }

  prevPhoto(): void {
    if (this.selectedFolder && this.selectedFolder.photos.length > 1) {
      this.selectedPhotoIndex = (this.selectedPhotoIndex - 1 + this.selectedFolder.photos.length) % this.selectedFolder.photos.length;
    }
  }

  // Refresh photos from Supabase
  async refreshPhotos(): Promise<void> {
    await this.galleryService.refresh();
  }

  // Keyboard navigation
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.selectedFolder) return;

    if (event.key === 'Escape') {
      this.closeModal();
    } else if (event.key === 'ArrowRight') {
      this.nextPhoto();
    } else if (event.key === 'ArrowLeft') {
      this.prevPhoto();
    }
  }

  trackById(index: number, photo: GalleryPhoto): string {
    return photo.id;
  }

  trackByFolderId(index: number, folder: Folder): string {
    return folder.id;
  }
}
