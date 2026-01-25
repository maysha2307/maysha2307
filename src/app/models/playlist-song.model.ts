export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl?: string;  // 30-second preview from iTunes
  addedAt: string;
  note?: string;  // Why this song is special to us
}

export interface iTunesSearchResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
}
