export interface IPlaylist {
  name: string;
  description: string;
  logoUrl: string;
  handle: string;
  songs: ISong[];
}

export interface ISong {
  title: string;
  artist: string;
  link: string;
}