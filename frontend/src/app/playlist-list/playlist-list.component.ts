import { Component, OnInit } from '@angular/core';

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
  imports: [],
  templateUrl: './playlist-list.component.html',
  styleUrl: './playlist-list.component.css'
})
export class PlaylistListComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
