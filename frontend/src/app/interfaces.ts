export interface Playlist {
  name: string;
  description: string;
  logoUrl: string;
  handle: string;
  songs: Song[];
}

export interface Song {
  title: string;
  artist: string;
  link: string;
}