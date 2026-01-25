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
    hisInstagram: 'https://instagram.com/your_handle',
    herInstagram: 'https://instagram.com/her_handle',
    coupleInstagram: 'https://instagram.com/our_handle'
  };

  // 🔗 Other Websites - Add your special occasion sites here!
  otherLinks = [
    { name: "Valentine's Day", url: 'https://example.com/valentines', icon: '💝' },
    { name: 'Anniversary', url: 'https://example.com/anniversary', icon: '💍' }
  ];

  // 💗 Footer message
  loveMessage = 'our love - Maysha';
}
