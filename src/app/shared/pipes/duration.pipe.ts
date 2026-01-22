import { Pipe, PipeTransform } from '@angular/core';

/**
 * DurationPipe - Converts duration in hours to human-readable format
 * Usage: {{ 125 | duration }} => "125 hours (5d 5h)"
 */
@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(hours: number, format: 'short' | 'long' | 'compact' = 'short'): string {
    if (!hours || hours < 0) {
      return '0 hours';
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    switch (format) {
      case 'compact':
        if (days > 0) {
          return remainingHours > 0 
            ? `${days}d ${remainingHours}h` 
            : `${days}d`;
        }
        return `${hours}h`;

      case 'long':
        const parts: string[] = [];
        if (days > 0) {
          parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        }
        if (remainingHours > 0) {
          parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
        }
        return parts.length > 0 ? parts.join(' ') : '0 hours';

      case 'short':
      default:
        if (days > 0) {
          return `${hours} hours (${days}d ${remainingHours}h)`;
        }
        return `${hours} hours`;
    }
  }
}
