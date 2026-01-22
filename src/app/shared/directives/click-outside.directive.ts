import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * ClickOutsideDirective - Detects clicks outside the element
 * Usage: <div (clickOutside)="onClickOutside()">Content</div>
 */
@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
