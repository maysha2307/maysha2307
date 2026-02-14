import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PasswordComponent } from './components/password/password.component';
import { ThoughtsComponent } from './components/thoughts/thoughts.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { DialogComponent } from './components/shared/dialog/dialog.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { MemoryRecapComponent } from './components/memory-recap/memory-recap.component';
import { GamesComponent } from './components/games/games.component';
import { WeKnowUsComponent } from './components/games/we-know-us/we-know-us.component';
import { RandomDrawingComponent } from './components/games/random-drawing/random-drawing.component';
import { LoveCounterComponent } from './components/love-counter/love-counter.component';
import { RootPageComponent } from './components/root-page/root-page.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { FooterComponent } from './components/footer/footer.component';
import { AnniversaryComponent } from './components/anniversary/anniversary.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    PasswordComponent,
    ThoughtsComponent,
    TimelineComponent,
    DialogComponent,
    GalleryComponent,
    MemoryRecapComponent,
    GamesComponent,
    WeKnowUsComponent,
    RandomDrawingComponent,
    LoveCounterComponent,
    RootPageComponent,
    PlaylistComponent,
    FooterComponent,
    AnniversaryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
