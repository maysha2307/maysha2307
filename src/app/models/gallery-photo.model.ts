export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  googleDriveImageUrl: string; // Direct image URL from Google Drive
  thumbnail?: string; // Optional custom thumbnail
}
