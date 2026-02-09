import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  // 💕 Social Links - Replace with your actual handles!
  socials = {
    hisInstagram: 'https://instagram.com/mashooq_min',
    herInstagram: 'https://instagram.com/xerxes.xxiv',
    coupleInstagram: 'https://instagram.com/maysha_23.7',
  };

  // 🔗 Other Websites - Add your special occasion sites here!
  otherLinks = [
    { name: "Surprise Event", url: 'https://example.com/surprise', icon: '💝' },
    { name: 'Anniversary', url: 'https://example.com/anniversary', icon: '💍' }
  ];

  // 💗 Footer message
  loveMessage = 'our love - Maysha';
}
