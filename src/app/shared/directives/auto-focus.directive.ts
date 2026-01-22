import { Directive, ElementRef, OnInit, Input } from '@angular/core';

/**
 * AutoFocusDirective - Automatically focuses element on load
 * Usage: <input appAutoFocus />
 * Usage: <input [appAutoFocus]="true" />
 */
@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements OnInit {
  @Input() appAutoFocus: boolean = true;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    if (this.appAutoFocus) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 100);
    }
  }
}
