import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements AfterViewInit {
  menuOpen = false;

  sectionIds = [
    'home-section',
    'thoughts-section',
    'timeline-section',
    'gallery-section',
    'memory-recap-section',
    'games-section',
    'love-counter-section'
  ];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove('menu-open');
  }

  scrollToSection(section: string) {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onMenuClick(event: Event, sectionId: string) {
    event.preventDefault();
    this.scrollToSection(sectionId);
    this.menuOpen = false;
  }

  ngAfterViewInit() {
    const navbar = document.querySelector('.romantic-navbar') as HTMLElement;
    if (navbar) {
      document.documentElement.style.setProperty('--navbar-height', navbar.offsetHeight + 'px');
    }
  }
}
