import { Pipe, PipeTransform } from '@angular/core';

/**
 * FilterPipe - Filters array based on search term
 * Usage: {{ items | filter:searchTerm:'name' }}
 * Note: Use with caution in templates as it may impact performance
 */
@Pipe({
  name: 'filter',
  standalone: true,
  pure: false // Make it impure to detect array changes
})
export class FilterPipe implements PipeTransform {
  transform<T>(items: T[], searchTerm: string, property?: keyof T): T[] {
    if (!items || !searchTerm) {
      return items;
    }

    searchTerm = searchTerm.toLowerCase();

    return items.filter(item => {
      if (property) {
        const value = item[property];
        return String(value).toLowerCase().includes(searchTerm);
      } else {
        // Search in all string properties
        return Object.values(item as any).some(val => 
          String(val).toLowerCase().includes(searchTerm)
        );
      }
    });
  }
}
