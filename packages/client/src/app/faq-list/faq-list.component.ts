import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService, ConfigService, ThemeService } from '../services';
import { FaqItem, FlatModule, Version } from '../models';
import { ButtonComponent, SelectComponent } from '@repo/ui-lib';

const SEARCH_HISTORY_KEY = 'faq_search_history';
const MAX_HISTORY = 10;

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent, SelectComponent],
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.scss'],
})
export class FaqListComponent implements OnInit {
  private faqService = inject(FaqService);
  private configService = inject(ConfigService);
  public themeService = inject(ThemeService);

  faqs = signal<FaqItem[]>([]);
  modules = signal<FlatModule[]>([]);
  versions = signal<Version[]>([]);
  selectedModule = signal<string>('');
  selectedVersion = signal<string>('');
  selectedStatus = signal<string>('');
  keywordSearch = '';
  searchFocused = false;
  showAdvancedSearch = false;
  showSearchHistory = false;
  searchHistory = signal<string[]>([]);
  advancedVersion = '';
  advancedStatus = '';

  statusOptions = [
    { label: '全部状态', value: '' },
    { label: '已解决', value: 'resolved' },
    { label: '处理中', value: 'pending' },
    { label: '已关闭', value: 'closed' },
  ];

  usedModules = computed(() => {
    const moduleIds = new Set(this.faqs().map((f) => f.component));
    return this.modules().filter((m) => moduleIds.has(m.id));
  });

  versionOptions = computed(() => {
    const usedVersions = new Set(this.faqs().map((f) => f.version));
    return [{ label: '全部版本', value: '' }, ...this.versions().filter((v) => usedVersions.has(v.name)).map((v) => ({ label: v.name, value: v.name }))];
  });

  popularTags = computed(() => {
    const tagCount = new Map<string, number>();
    this.faqs().forEach((faq) => faq.tags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) || 0) + 1)));
    return Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
  });

  filteredFaqs = computed(() => {
    let result = this.faqs();
    if (this.selectedModule()) result = result.filter((f) => f.component === this.selectedModule());
    if (this.selectedVersion()) result = result.filter((f) => f.version === this.selectedVersion());
    if (this.selectedStatus()) result = result.filter((f) => f.status === this.selectedStatus());
    if (this.keywordSearch.trim()) {
      const search = this.keywordSearch.toLowerCase();
      result = result.filter((f) =>
        f.title.toLowerCase().includes(search) || f.summary.toLowerCase().includes(search) ||
        f.phenomenon.toLowerCase().includes(search) || f.solution.toLowerCase().includes(search) ||
        f.errorCode?.toLowerCase().includes(search) || f.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }
    return result;
  });

  // 统计数据
  stats = computed(() => {
    const all = this.faqs();
    return {
      total: all.length,
      resolved: all.filter((f) => f.status === 'resolved').length,
      pending: all.filter((f) => f.status === 'pending').length,
      totalViews: all.reduce((sum, f) => sum + (f.views || 0), 0),
    };
  });

  ngOnInit() {
    this.loadData();
    this.loadSearchHistory();
  }

  private loadData() {
    this.faqService.getAll().subscribe((data) => this.faqs.set(data));
    this.configService.getFlatModules().subscribe((data) => this.modules.set(data));
    this.configService.getVersions().subscribe((data) => this.versions.set(data));
  }

  private loadSearchHistory() {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) this.searchHistory.set(JSON.parse(history));
  }

  private saveSearchHistory(keyword: string) {
    if (!keyword.trim()) return;
    const history = this.searchHistory().filter((h) => h !== keyword);
    history.unshift(keyword);
    const newHistory = history.slice(0, MAX_HISTORY);
    this.searchHistory.set(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  }

  onSearchSubmit() {
    this.saveSearchHistory(this.keywordSearch);
    this.showSearchHistory = false;
  }

  onSearchFocus() {
    this.searchFocused = true;
    this.showSearchHistory = this.searchHistory().length > 0;
  }

  onSearchBlur() {
    this.searchFocused = false;
    setTimeout(() => (this.showSearchHistory = false), 200);
  }

  selectHistory(keyword: string) {
    this.keywordSearch = keyword;
    this.showSearchHistory = false;
    this.saveSearchHistory(keyword);
  }

  clearHistory() {
    this.searchHistory.set([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    this.showSearchHistory = false;
  }

  filterByModule(moduleId: string) { this.selectedModule.set(moduleId); }
  filterByVersion(version: string) { this.selectedVersion.set(version); }
  filterByStatus(status: string) { this.selectedStatus.set(status); }
  searchByTag(tag: string) { this.keywordSearch = tag; this.saveSearchHistory(tag); }
  toggleAdvancedSearch() { this.showAdvancedSearch = !this.showAdvancedSearch; }
  clearFilters() { this.selectedModule.set(''); this.selectedVersion.set(''); this.selectedStatus.set(''); this.keywordSearch = ''; }

  getModuleName(moduleId: string): string {
    const module = this.modules().find((m) => m.id === moduleId);
    return module ? (module.parentName ? `${module.parentName} - ${module.name}` : module.name) : moduleId;
  }

  highlightText(text: string): string {
    if (!this.keywordSearch.trim()) return text;
    const regex = new RegExp(`(${this.escapeRegExp(this.keywordSearch)})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
