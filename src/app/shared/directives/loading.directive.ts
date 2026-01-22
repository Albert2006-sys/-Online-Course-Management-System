import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

/**
 * LoadingDirective - Shows loading state on element
 * Usage: <button [appLoading]="isLoading">Submit</button>
 */
@Directive({
  selector: '[appLoading]',
  standalone: true
})
export class LoadingDirective implements OnInit {
  private _isLoading = false;
  private spinner: HTMLElement | null = null;
  private originalContent: string = '';

  @Input() set appLoading(value: boolean) {
    this._isLoading = value;
    this.updateLoadingState();
  }

  @Input() loadingText = 'Loading...';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.originalContent = this.el.nativeElement.innerHTML;
  }

  private updateLoadingState() {
    if (this._isLoading) {
      this.showLoading();
    } else {
      this.hideLoading();
    }
  }

  private showLoading() {
    // Disable element
    this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');

    // Create spinner
    this.spinner = this.renderer.createElement('span');
    this.renderer.addClass(this.spinner, 'loading-spinner');
    this.renderer.setStyle(this.spinner, 'display', 'inline-block');
    this.renderer.setStyle(this.spinner, 'width', '16px');
    this.renderer.setStyle(this.spinner, 'height', '16px');
    this.renderer.setStyle(this.spinner, 'border', '2px solid rgba(255,255,255,0.3)');
    this.renderer.setStyle(this.spinner, 'border-top-color', '#fff');
    this.renderer.setStyle(this.spinner, 'border-radius', '50%');
    this.renderer.setStyle(this.spinner, 'animation', 'spin 0.6s linear infinite');
    this.renderer.setStyle(this.spinner, 'margin-right', '8px');

    // Add keyframes for animation
    this.addSpinAnimation();

    // Update content
    this.el.nativeElement.innerHTML = '';
    this.renderer.appendChild(this.el.nativeElement, this.spinner);
    this.renderer.appendChild(
      this.el.nativeElement,
      this.renderer.createText(this.loadingText)
    );
  }

  private hideLoading() {
    // Enable element
    this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
    this.renderer.removeStyle(this.el.nativeElement, 'pointer-events');

    // Restore original content
    this.el.nativeElement.innerHTML = this.originalContent;
    this.spinner = null;
  }

  private addSpinAnimation() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    
    if (!document.querySelector('style[data-loading-directive]')) {
      style.setAttribute('data-loading-directive', 'true');
      document.head.appendChild(style);
    }
  }
}
