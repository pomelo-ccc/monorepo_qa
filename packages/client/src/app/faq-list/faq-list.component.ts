import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService, ConfigService, ThemeService } from '../services';
import { FaqItem, FlatModule } from '../models';
import { ButtonComponent } from '@repo/ui-lib';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent],
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.scss'],
})
export class FaqListComponent implements OnInit {
  private faqService = inject(FaqService);
  private configService = inject(ConfigService);
  public themeService = inject(ThemeService);

  faqs = signal<FaqItem[]>([]);
  modules = signal<FlatModule[]>([]);
  selectedModule = signal<string>('');
  keywordSearch = '';
  searchFocused = false;

  usedModules = computed(() => {
    const moduleIds = new Set(this.faqs().map((f) => f.component));
    return this.modules().filter((m) => moduleIds.has(m.id));
  });

  popularTags = computed(() => {
    const tagCount = new Map<string, number>();
    this.faqs().forEach((faq) => faq.tags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) || 0) + 1)));
    return Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
  });

  filteredFaqs = computed(() => {
    let result = this.faqs();
    if (this.selectedModule()) {
      result = result.filter((f) => f.component === this.selectedModule());
    }
    if (this.keywordSearch.trim()) {
      const search = this.keywordSearch.toLowerCase();
      result = result.filter((f) =>
        f.title.toLowerCase().includes(search) ||
        f.summary.toLowerCase().includes(search) ||
        f.phenomenon.toLowerCase().includes(search) ||
        f.solution.toLowerCase().includes(search) ||
        f.errorCode?.toLowerCase().includes(search) ||
        f.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }
    return result;
  });

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.faqService.getAll().subscribe((data) => this.faqs.set(data));
    this.configService.getFlatModules().subscribe((data) => this.modules.set(data));
  }

  filterByModule(moduleId: string) {
    this.selectedModule.set(moduleId);
  }

  searchByTag(tag: string) {
    this.keywordSearch = tag;
  }

  getModuleName(moduleId: string): string {
    const module = this.modules().find((m) => m.id === moduleId);
    if (!module) return moduleId;
    return module.parentName ? `${module.parentName} - ${module.name}` : module.name;
  }
}
