import { Pipe, PipeTransform } from '@angular/core';

/**
 * TruncatePipe - Truncates text to specified length with ellipsis
 * Usage: {{ longText | truncate:50 }} => "This is a very long text that will be trunca..."
 * Usage: {{ longText | truncate:50:'***' }} => "This is a very long text that will be trunca***"
 */
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, ellipsis: string = '...'): string {
    if (!value) {
      return '';
    }

    if (value.length <= limit) {
      return value;
    }

    return value.substring(0, limit) + ellipsis;
  }
}
