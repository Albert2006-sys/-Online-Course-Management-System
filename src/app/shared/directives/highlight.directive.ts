import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * HighlightDirective - Highlights element on hover with custom color
 * Usage: <div appHighlight highlightColor="yellow">Hover me</div>
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() highlightColor = '#fff3cd';
  @Input() defaultColor = 'transparent';

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.transition = 'background-color 0.3s ease';
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.defaultColor);
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
