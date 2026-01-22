import { Pipe, PipeTransform } from '@angular/core';

/**
 * OrderByPipe - Sorts array by specified property
 * Usage: {{ items | orderBy:'name' }}
 * Usage: {{ items | orderBy:'price':'desc' }}
 */
@Pipe({
  name: 'orderBy',
  standalone: true,
  pure: false
})
export class OrderByPipe implements PipeTransform {
  transform<T>(items: T[], property: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    if (!items || !property) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];

      let comparison = 0;

      if (aVal > bVal) {
        comparison = 1;
      } else if (aVal < bVal) {
        comparison = -1;
      }

      return order === 'desc' ? comparison * -1 : comparison;
    });
  }
}
