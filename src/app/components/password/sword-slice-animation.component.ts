import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sword-slice-animation',
  templateUrl: './sword-slice-animation.component.html',
  styleUrls: ['./sword-slice-animation.component.scss']
})
export class SwordSliceAnimationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() animationComplete = new EventEmitter<void>();
  
  showSlashes = false;
  showFragments = false;
  animationStarted = false;

  ngOnInit() {}

  ngAfterViewInit() {
    // Start the sword slicing animation sequence
    setTimeout(() => {
      this.startAnimation();
    }, 100);
  }

  startAnimation() {
    this.animationStarted = true;
    
    // Show sword slashes
    setTimeout(() => {
      this.showSlashes = true;
    }, 300);
    
    // Show screen fragments
    setTimeout(() => {
      this.showFragments = true;
    }, 800);
    
    // Complete animation
    setTimeout(() => {
      this.animationComplete.emit();
    }, 2500);
  }

  ngOnDestroy() {}
}
