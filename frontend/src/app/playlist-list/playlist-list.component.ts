import { Component, OnInit } from '@angular/core';
import SonglyApi from '../../api/api';
import { NgFor } from '@angular/common';

/** Show page with list of playlists.
 *
 * On mount, loads playlists from API.
 *
 * This is routed to at /playlists
 *
 * App -> PlaylistList
 */

@Component({
  selector: 'app-playlist-list',
  standalone: true,
  imports: [
    NgFor,
  ],
  templateUrl: './playlist-list.component.html',
  styleUrl: './playlist-list.component.css'
})
export class PlaylistListComponent implements OnInit {
  playlists: any[] = [];

  constructor() { }

  async ngOnInit(): Promise<any> {
    this.playlists = await SonglyApi.getPlaylists();
    console.log("Playlists for component:", this.playlists);
  }
}
