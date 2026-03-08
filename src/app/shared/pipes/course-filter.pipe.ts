import { Pipe, PipeTransform } from '@angular/core';
import { Course, CourseCategory, CourseLevel } from '@shared/models/course.model';

/**
 * CourseFilterPipe - Filters courses by category and/or level
 * Usage: {{ courses | courseFilter:selectedCategory:selectedLevel }}
 * Satisfies requirement: "Create custom pipes to filter courses by category or level"
 */
@Pipe({
    name: 'courseFilter',
    standalone: true,
    pure: false // Impure so it reacts to array mutations
})
export class CourseFilterPipe implements PipeTransform {
    transform(
        courses: Course[],
        category?: CourseCategory | string,
        level?: CourseLevel | string
    ): Course[] {
        if (!courses) return [];

        let filtered = [...courses];

        // Filter by category
        if (category && category !== '') {
            filtered = filtered.filter(
                c => c.category === category
            );
        }

        // Filter by level
        if (level && level !== '') {
            filtered = filtered.filter(
                c => c.level === level
            );
        }

        return filtered;
    }
}
