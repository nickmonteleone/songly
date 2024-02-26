import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { PlaylistListComponent } from './playlist-list/playlist-list.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'playlists', component: PlaylistListComponent },
  { path: '*', redirectTo: '' },
];
