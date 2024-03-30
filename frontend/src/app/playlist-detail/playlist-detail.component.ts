import { Component, OnInit } from '@angular/core';
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
  songs: Song[] = [];
}
