import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PasswordComponent } from './components/password/password.component';
import { ThoughtsComponent } from './components/thoughts/thoughts.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { MemoryRecapComponent } from './components/memory-recap/memory-recap.component';
import { GamesComponent } from './components/games/games.component';
import { LoveCounterComponent } from './components/love-counter/love-counter.component';
import { RootPageComponent } from './components/root-page/root-page.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    PasswordComponent,
    ThoughtsComponent,
    TimelineComponent,
    GalleryComponent,
    MemoryRecapComponent,
    GamesComponent,
    LoveCounterComponent,
    RootPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
