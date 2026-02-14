import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  // 💕 Social Links - Replace with your actual handles!
  socials = {
    hisInstagram: 'https://instagram.com/mashooq_min',
    herInstagram: 'https://instagram.com/xerxes.xxiv',
    coupleInstagram: 'https://instagram.com/maysha_23.7',
  };

  // 🔗 Other Websites - Add your special occasion sites here!
  otherLinks = [
    { name: "Valentine's Day", url: 'https://maysha-valentines.netlify.app', icon: '💝' },
    // changed to requested shy-combo emoji
    { name: 'Anniversary', url: '/anniversary', icon: '😳👉👈' }
  ];

  // 💗 Footer message
  loveMessage = 'our love - Maysha';

  // Open internal routes with the router, external links in a new tab/window
  onLinkClick(link: { name: string; url: string }, event: Event) {
    // prevent default anchor behavior (we handle navigation)
    event.preventDefault();

    if (!link || !link.url) return;

    if (link.url.startsWith('/')) {
      // internal route
      this.router.navigateByUrl(link.url).catch(() => undefined);
    } else {
      // external — use window.open to force new tab (noopener)
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  }
}
