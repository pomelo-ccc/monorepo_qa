import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FaqService, ConfigService } from '../services';
import { FaqItem, FlatModule, Version } from '../models';
import { CardComponent } from '@repo/ui-lib';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private faqService = inject(FaqService);
  private configService = inject(ConfigService);

  faqs = signal<FaqItem[]>([]);
  modules = signal<FlatModule[]>([]);
  versions = signal<Version[]>([]);

  // 统计数据
  stats = computed(() => {
    const all = this.faqs();
    const resolved = all.filter((f) => f.status === 'resolved').length;
    const pending = all.filter((f) => f.status === 'pending').length;
    const closed = all.filter((f) => f.status === 'closed').length;
    return {
      total: all.length,
      resolved,
      pending,
      closed,
      resolveRate: all.length ? Math.round((resolved / all.length) * 100) : 0,
      totalViews: all.reduce((sum, f) => sum + (f.views || 0), 0),
      avgSolveTime: all.length ? Math.round(all.reduce((sum, f) => sum + (f.solveTimeMinutes || 0), 0) / all.length) : 0,
    };
  });

  // 按模块统计
  moduleStats = computed<ChartData[]>(() => {
    const counts = new Map<string, number>();
    this.faqs().forEach((f) => counts.set(f.component, (counts.get(f.component) || 0) + 1));
    const colors = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, value], i) => {
        const mod = this.modules().find((m) => m.id === id);
        return { label: mod?.name || id, value, color: colors[i % colors.length] };
      });
  });

  // 按状态统计
  statusStats = computed<ChartData[]>(() => [
    { label: '已解决', value: this.stats().resolved, color: '#22c55e' },
    { label: '处理中', value: this.stats().pending, color: '#f59e0b' },
    { label: '已关闭', value: this.stats().closed, color: '#6b7280' },
  ]);

  // 热门标签
  topTags = computed(() => {
    const counts = new Map<string, number>();
    this.faqs().forEach((f) => f.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  });

  // 热门问题
  topFaqs = computed(() => this.faqs().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5));

  // 最近更新
  recentFaqs = computed(() =>
    this.faqs().sort((a, b) => new Date(b.createTime || 0).getTime() - new Date(a.createTime || 0).getTime()).slice(0, 5)
  );

  ngOnInit() {
    this.faqService.getAll().subscribe((data) => this.faqs.set(data));
    this.configService.getFlatModules().subscribe((data) => this.modules.set(data));
    this.configService.getVersions().subscribe((data) => this.versions.set(data));
  }

  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map((d) => d.value), 1);
  }

  getBarWidth(value: number, max: number): number {
    return (value / max) * 100;
  }
}
