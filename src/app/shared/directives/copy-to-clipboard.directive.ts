import { Directive, HostListener, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * CopyToClipboardDirective - Copies text to clipboard on click
 * Usage: <button [appCopyToClipboard]="textToCopy">Copy</button>
 */
@Directive({
  selector: '[appCopyToClipboard]',
  standalone: true
})
export class CopyToClipboardDirective {
  @Input() appCopyToClipboard = '';
  @Input() copyMessage = 'Copied to clipboard!';
  @Input() showNotification = true;

  constructor(private snackBar: MatSnackBar) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    
    if (!this.appCopyToClipboard) {
      return;
    }

    this.copyToClipboard(this.appCopyToClipboard);
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      // Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        this.showSuccess();
      } else {
        // Fallback for older browsers
        this.fallbackCopy(text);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showSuccess();
    } catch (err) {
      console.error('Fallback: Failed to copy', err);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  private showSuccess(): void {
    if (this.showNotification) {
      this.snackBar.open(this.copyMessage, 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
  }
}
