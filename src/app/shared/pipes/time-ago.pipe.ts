import { Pipe, PipeTransform } from '@angular/core';

/**
 * TimeAgoPipe - Converts date to relative time (e.g., "2 hours ago")
 * Usage: {{ date | timeAgo }} => "2 hours ago"
 */
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) {
      return 'just now';
    }

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);

      if (interval >= 1) {
        return interval === 1 
          ? `1 ${name} ago` 
          : `${interval} ${name}s ago`;
      }
    }

    return 'just now';
  }
}
