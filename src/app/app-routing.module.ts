
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordComponent } from './components/password/password.component';
import { RootPageComponent } from './components/root-page/root-page.component';
import { HomeComponent } from './components/home/home.component';
import { ThoughtsComponent } from './components/thoughts/thoughts.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { MemoryRecapComponent } from './components/memory-recap/memory-recap.component';
import { GamesComponent } from './components/games/games.component';
import { LoveCounterComponent } from './components/love-counter/love-counter.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: PasswordComponent },
  {
    path: 'app',
    component: RootPageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'thoughts', component: ThoughtsComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'memory-recap', component: MemoryRecapComponent },
      { path: 'playlist', component: PlaylistComponent },
      { path: 'games', component: GamesComponent },
      { path: 'love-counter', component: LoveCounterComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
