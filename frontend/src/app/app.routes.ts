import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { PlaylistListComponent } from './playlist-list/playlist-list.component';
import { PlaylistDetailComponent } from './playlist-detail/playlist-detail.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'playlists', component: PlaylistListComponent },
  { path: 'playlists/:handle', component: PlaylistDetailComponent },
  { path: '*', redirectTo: '' },
];
