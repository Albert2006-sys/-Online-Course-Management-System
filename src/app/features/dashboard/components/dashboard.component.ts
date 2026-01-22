import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { DashboardService } from '../services/dashboard.service';
import { DashboardStats, CourseSummary, EnrollmentTrend } from '@shared/models/common.model';
import { DashboardDetailDialogComponent, DashboardDetailData } from './dashboard-detail-dialog/dashboard-detail-dialog.component';

// Register Chart.js components
Chart.register(...registerables);

type TrendDirection = 'up' | 'down' | 'flat';

interface StatTrend {
  text: string;
  direction: TrendDirection;
  label: string;
}

/**
 * DashboardComponent - Analytics and statistics visualization
 * Features: Statistics cards, pie chart, line chart, bar chart
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatListModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart') performanceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('completionChart') completionChartRef!: ElementRef<HTMLCanvasElement>;

  dashboardStats: DashboardStats | null = null;
  recentCourses: CourseSummary[] = []; // Last 5 recent courses
  isLoading = true;

  // Insights
  mostPopularCourse = '';
  topCategory = '';
  leastPopularCourse = '';

  engagementMetrics: Array<{ label: string; value: string; helper: string; icon: string }> = [];
  learningFunnel: Array<{ label: string; value: number; percent: number }> = [];
  courseAlerts: Array<{ title: string; detail: string; severity: 'warn' | 'info' }> = [];

  statTrends: Record<'courses' | 'students' | 'enrollments' | 'revenue', StatTrend> = {
    courses: { text: '0%', direction: 'flat', label: 'vs prev month' },
    students: { text: '0%', direction: 'flat', label: 'vs prev month' },
    enrollments: { text: '0%', direction: 'flat', label: 'vs last month' },
    revenue: { text: '0%', direction: 'flat', label: 'vs last month' }
  };

  // Chart instances
  private categoryChart: Chart | null = null;
  private trendChart: Chart | null = null;
  private performanceChart: Chart | null = null;
  private revenueChart: Chart | null = null;
  private completionChart: Chart | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    // Destroy chart instances to prevent memory leaks
    this.destroyCharts();
  }

  /**
   * Load dashboard statistics
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        // Get last 5 courses as recent courses
        this.recentCourses = stats.popularCourses.slice(0, 5);
        
        // Calculate Insights & derived UI datasets
        this.calculateInsights(stats);
        this.calculateCardTrends(stats);
        this.buildEngagementMetrics(stats);
        this.buildLearningFunnel(stats);
        this.buildCourseAlerts(stats);

        this.isLoading = false;
        
        // Wait for view initialization before creating charts
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  calculateInsights(stats: DashboardStats) {
     if (stats.popularCourses.length > 0) {
        // Most Popular (already sorted descending in service usually, or we sort here)
        const sorted = [...stats.popularCourses].sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        this.mostPopularCourse = sorted[0].title;
        // Least Popular
        const active = sorted.filter(c => c.enrollmentCount > 0);
        this.leastPopularCourse = active.length > 0 ? active[active.length - 1].title : 'N/A';
     }

     if (stats.categoryDistribution.length > 0) {
        const sortedCats = [...stats.categoryDistribution].sort((a, b) => b.courseCount - a.courseCount);
        this.topCategory = sortedCats[0].category;
     }
  }

  private calculateCardTrends(stats: DashboardStats): void {
    this.statTrends = {
      courses: this.buildTrendFromMonthly(stats.courses, 'createdAt', 'vs prev month'),
      students: this.buildTrendFromMonthly(stats.students, 'createdAt', 'vs prev month'),
      enrollments: this.buildTrendFromSeries(stats.enrollmentTrends, 'enrollments', 'vs last month'),
      revenue: this.buildTrendFromSeries(stats.enrollmentTrends, 'revenue', 'vs last month')
    };
  }

  private buildTrendFromMonthly(collection: any[] | undefined, dateKey: string, label: string): StatTrend {
    if (!collection?.length) {
      return { text: '0%', direction: 'flat', label };
    }

    const { current, previous, hasData } = this.getMonthlyCounts(collection, dateKey);
    if (!hasData) {
      return { text: '0%', direction: 'flat', label };
    }

    const percentChange = this.calculatePercentChange(previous, current);
    return this.buildTrend(percentChange, label, true);
  }

  private buildTrendFromSeries(
    trends: EnrollmentTrend[] | undefined,
    field: keyof Pick<EnrollmentTrend, 'enrollments' | 'revenue'>,
    label: string
  ): StatTrend {
    if (!trends || trends.length < 2) {
      return { text: '0%', direction: 'flat', label };
    }

    const latest = trends[trends.length - 1][field] ?? 0;
    const previous = trends[trends.length - 2][field] ?? 0;
    const percentChange = this.calculatePercentChange(previous, latest);
    return this.buildTrend(percentChange, label, true);
  }

  private getMonthlyCounts(collection: any[], dateKey: string): { current: number; previous: number; hasData: boolean } {
    const now = new Date();
    const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let current = 0;
    let previous = 0;
    let hasData = false;

    collection.forEach(item => {
      const date = this.parseDate(item?.[dateKey]);
      if (!date) {
        return;
      }
      hasData = true;

      if (date >= startOfCurrent) {
        current += 1;
      } else if (date >= startOfPrevious && date < startOfCurrent) {
        previous += 1;
      }
    });

    return { current, previous, hasData };
  }

  private parseDate(value: any): Date | null {
    if (!value) {
      return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private calculatePercentChange(previous: number, current: number): number | null {
    if (previous === 0) {
      if (current === 0) {
        return 0;
      }
      return current > 0 ? 100 : -100;
    }
    return ((current - previous) / previous) * 100;
  }

  private buildTrend(value: number | null, label: string, isPercent = true): StatTrend {
    if (value === null || !Number.isFinite(value)) {
      return { text: '0%', direction: 'flat', label };
    }

    const clamped = Math.max(Math.min(Math.round(value), 999), -999);
    const direction: TrendDirection = clamped > 0 ? 'up' : clamped < 0 ? 'down' : 'flat';
    const suffix = isPercent ? '%' : '';
    const prefix = clamped > 0 ? '+' : clamped < 0 ? '' : '';
    const text = direction === 'flat' ? `0${suffix}` : `${prefix}${clamped}${suffix}`;

    return { text, direction, label };
  }

  getTrendIcon(direction: TrendDirection): string {
    switch (direction) {
      case 'up':
        return 'arrow_upward';
      case 'down':
        return 'arrow_downward';
      default:
        return 'horizontal_rule';
    }
  }

  private buildEngagementMetrics(stats: DashboardStats): void {
    const completionRate = this.calculateRate(stats.completedEnrollments, stats.totalEnrollments);
    const activeRate = this.calculateRate(stats.activeEnrollments, stats.totalEnrollments);
    const enrollmentGrowth = this.getGrowth();

    this.engagementMetrics = [
      {
        label: 'Avg. Rating',
        value: stats.averageRating ? `${stats.averageRating.toFixed(1)}/5` : 'N/A',
        helper: 'Learner satisfaction',
        icon: 'thumb_up'
      },
      {
        label: 'Completion Rate',
        value: `${completionRate}%`,
        helper: 'Finished / enrolled',
        icon: 'task_alt'
      },
      {
        label: 'Active Engagement',
        value: `${activeRate}%`,
        helper: 'Active learners',
        icon: 'bolt'
      },
      {
        label: 'Enrollment Growth',
        value: `${Math.round(enrollmentGrowth)}%`,
        helper: 'Vs last month',
        icon: enrollmentGrowth >= 0 ? 'trending_up' : 'trending_down'
      }
    ];
  }

  private buildLearningFunnel(stats: DashboardStats): void {
    const total = stats.totalEnrollments || 0;
    const steps = [
      { label: 'Total Enrollments', value: stats.totalEnrollments },
      { label: 'Active Learners', value: stats.activeEnrollments },
      { label: 'Completed Learners', value: stats.completedEnrollments }
    ];

    this.learningFunnel = steps.map(step => ({
      label: step.label,
      value: step.value,
      percent: this.calculateRate(step.value, total)
    }));
  }

  private buildCourseAlerts(stats: DashboardStats): void {
    const alerts: Array<{ title: string; detail: string; severity: 'warn' | 'info' }> = [];

    const completionRate = this.calculateRate(stats.completedEnrollments, stats.totalEnrollments);
    if (completionRate && completionRate < 60) {
      alerts.push({
        title: 'Completion rate below target',
        detail: `Only ${completionRate}% of learners finish their courses. Consider adding check-ins or shorter modules.`,
        severity: 'warn'
      });
    }

    if (stats.averageRating && stats.averageRating < 4) {
      alerts.push({
        title: 'Learner satisfaction dipping',
        detail: `Average rating is ${stats.averageRating.toFixed(1)}/5. Review feedback to boost satisfaction.`,
        severity: 'warn'
      });
    }

    const lowEnrollmentCourses = (stats.courses || [])
      .filter(course => (course?.enrollmentCount || 0) < 10)
      .slice(0, 2);

    lowEnrollmentCourses.forEach(course => {
      alerts.push({
        title: `${course?.title || 'Course'} needs promotion`,
        detail: `${course?.enrollmentCount || 0} enrollments. Refresh SEO, add coupons, or feature it on the catalog.`,
        severity: 'info'
      });
    });

    this.courseAlerts = alerts.slice(0, 4);
  }

  private calculateRate(partial: number, total: number): number {
    if (!total || total <= 0) {
      return 0;
    }
    return Math.round((partial / total) * 100);
  }

  openDetail(type: 'courses' | 'students' | 'enrollments' | 'revenue', title: string) {
    if (!this.dashboardStats) return;

    let items: any[] = [];
    
    switch (type) {
      case 'courses':
        items = this.dashboardStats.courses || [];
        break;
      case 'students':
        items = this.dashboardStats.students || [];
        break;
      case 'enrollments':
        items = this.dashboardStats.allEnrollments || [];
        break;
      case 'revenue':
        // Calculate revenue per course for display
         if (this.dashboardStats.courses && this.dashboardStats.courses.length) {
            items = this.dashboardStats.courses.map((course: any) => ({
                title: course.title,
                revenue: course.price * (course.enrollmentCount || 0)
            })).sort((a: any, b: any) => b.revenue - a.revenue);
         }
        break;
    }

    this.dialog.open(DashboardDetailDialogComponent, {
      width: '800px',
      data: { type, title, items }
    });
  }


  /**
   * Create all charts
   */
  private createCharts(): void {
    if (!this.dashboardStats) return;

    this.createCategoryChart();
    this.createTrendChart();
    this.createPerformanceChart();
    this.createRevenueChart();
    this.createCompletionChart();
  }

  /**
   * Create category distribution pie chart
   */
  private createCategoryChart(): void {
    if (!this.categoryChartRef || !this.dashboardStats) return;

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const categories = this.dashboardStats.categoryDistribution;
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.category),
        datasets: [{
          label: 'Courses by Category',
          data: categories.map(c => c.courseCount),
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#4facfe',
            '#43e97b',
            '#fa709a',
            '#fee140',
            '#30cfd0',
            '#a8edea',
            '#ff6a88',
            '#feca57',
            '#48dbfb',
            '#ff9ff3',
            '#54a0ff',
            '#00d2d3'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              },
              padding: 10,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Course Distribution by Category',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = categories.reduce((sum, c) => sum + c.courseCount, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} courses (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.categoryChart = new Chart(ctx, config);
  }

  /**
   * Create enrollment trend line chart
   */
  private createTrendChart(): void {
    if (!this.trendChartRef || !this.dashboardStats) return;

    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const trends = this.dashboardStats.enrollmentTrends;
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: trends.map(t => t.month),
        datasets: [{
          label: 'Enrollments',
          data: trends.map(t => t.enrollments),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Enrollment Trends (Last 6 Months)',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                return `Enrollments: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.trendChart = new Chart(ctx, config);
  }

  /**
   * Create course performance bar chart
   */
  private createPerformanceChart(): void {
    if (!this.performanceChartRef || !this.dashboardStats) return;

    const ctx = this.performanceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Sort courses by enrollment count
    const topCourses = [...this.dashboardStats.popularCourses]
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topCourses.map(c => c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title),
        datasets: [{
          label: 'Enrollments',
          data: topCourses.map(c => c.enrollmentCount),
          backgroundColor: '#667eea',
          borderRadius: 4,
          barThickness: 20
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Top 5 Courses by Enrollment',
            font: { size: 14, weight: 'bold' },
            padding: 20
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { display: false }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    };

    this.performanceChart = new Chart(ctx, config);
  }

  /**
   * Create revenue trend bar chart
   */
  private createRevenueChart(): void {
    if (!this.revenueChartRef || !this.dashboardStats) return;

    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const trends = this.dashboardStats.enrollmentTrends;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: trends.map(t => t.month),
        datasets: [{
          label: 'Revenue',
          data: trends.map(t => t.revenue),
          backgroundColor: '#48bb78',
          borderRadius: 4,
          barThickness: 16
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Revenue History',
            font: { size: 14, weight: 'bold' },
            padding: 20
          },
           tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    this.revenueChart = new Chart(ctx, config);
  }

  /**
   * Create completion status doughnut chart
   */
  private createCompletionChart(): void {
    if (!this.completionChartRef || !this.dashboardStats) return;

    const ctx = this.completionChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const active = this.dashboardStats.activeEnrollments;
    const completed = this.dashboardStats.completedEnrollments;
    // Assume dropped or other if total > active + completed, otherwise just use these two types
    // For now, let's just use Active vs Completed
    
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Completed'],
        datasets: [{
          data: [active, completed],
          backgroundColor: ['#4299e1', '#48bb78'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Course Completion Status',
            font: { size: 14, weight: 'bold' },
            padding: 20
          }
        }
      }
    };

    this.completionChart = new Chart(ctx, config);
  }

  /**
   * Destroy all chart instances
   */
  private destroyCharts(): void {
    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = null;
    }
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    if (this.performanceChart) {
      this.performanceChart.destroy();
      this.performanceChart = null;
    }
    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.revenueChart = null;
    }
    if (this.completionChart) {
      this.completionChart.destroy();
      this.completionChart = null;
    }
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.destroyCharts();
    this.loadDashboardData();
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get growth percentage
   */
  getGrowth(): number {
    if (!this.dashboardStats || this.dashboardStats.enrollmentTrends.length < 2) {
      return 0;
    }

    const trends = this.dashboardStats.enrollmentTrends;
    const lastMonth = trends[trends.length - 1].enrollments;
    const previousMonth = trends[trends.length - 2].enrollments;

    if (previousMonth === 0) return lastMonth > 0 ? 100 : 0;

    return ((lastMonth - previousMonth) / previousMonth) * 100;
  }

  /**
   * Navigate to courses page - triggered by clicking Total Courses card
   */
  navigateToCourses(): void {
    this.router.navigate(['/courses']);
  }

  /**
   * Get popularity percentage for progress bar
   */
  getPopularityPercentage(enrollmentCount: number): number {
    if (!this.dashboardStats || !this.dashboardStats.popularCourses.length) {
      return 0;
    }
    const maxEnrollments = Math.max(...this.dashboardStats.popularCourses.map(c => c.enrollmentCount));
    return maxEnrollments > 0 ? Math.round((enrollmentCount / maxEnrollments) * 100) : 0;
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
