import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import SonglyApi from '../../api/api';
import { NgFor } from '@angular/common';
import { Playlist, Song } from '../interfaces';

/** Show page with details for playlist with songs.
 * On mount, loads playlist detail from API.
 * This is routed to at /playlists/:handle
 *
 * PlaylistList -> PlaylistDetail
 */

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [
    NgFor,
  ],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.css'
})
export class PlaylistDetailComponent {
  playlist: Playlist | null = null;
  playlistHandle: string = "";
  songs: Song[] = [];

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(
      params => {
        this.playlistHandle = params["handle"];
        this.getPlaylistInfo(this.playlistHandle);
      }
    );
  }

  async getPlaylistInfo(handle: string): Promise<void> {
    this.playlist = await SonglyApi.getPlaylist(handle);
    console.log("Playlist detail:", this.playlist);
    if (this.playlist && this.playlist.songs) {
      this.songs = this.playlist.songs;
      console.log("songs:", this.songs);
    }
  }
}
