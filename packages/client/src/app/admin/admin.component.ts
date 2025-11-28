import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService, DialogService } from '@repo/ui-lib';
import { ConfigService } from '../services/config.service';
import { FaqService } from '../services/faq.service';
import { FaqItem } from '../models';

interface ConfigItem {
  id: string;
  name: string;
  type?: string;
  parentId?: string;
  parentName?: string;
  description?: string;
}

interface FormData {
  id?: string;
  name?: string;
  parentId?: string;
  description?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  private configService = inject(ConfigService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private faqService = inject(FaqService);
  private router = inject(Router);

  activeTab: 'faqs' | 'modules' | 'tags' | 'versions' = 'faqs';
  showDialog = false;
  dialogType: 'module' | 'tag' | 'version' = 'module';
  editingItem: ConfigItem | null = null;
  formData: FormData = {};

  // 筛选相关
  faqSearch = '';
  faqStatusFilter = '';
  faqModuleFilter = '';
  pageSize = 10;
  newTagName = '';

  // 数据
  faqData: FaqItem[] = [];
  filteredFaqs: FaqItem[] = [];
  allModules: ConfigItem[] = [];
  tagData: ConfigItem[] = [];
  versionData: ConfigItem[] = [];

  ngOnInit() {
    this.loadData();
    this.loadFaqs();
  }

  get dialogTitle() {
    const titles = { module: '模块', tag: '标签', version: '版本' };
    return titles[this.dialogType];
  }

  loadFaqs() {
    this.faqService.getAll().subscribe((faqs) => {
      this.faqData = faqs;
      this.filterFaqs();
    });
  }

  filterFaqs() {
    this.filteredFaqs = this.faqData.filter((faq) => {
      const matchSearch = !this.faqSearch || faq.title.toLowerCase().includes(this.faqSearch.toLowerCase());
      const matchStatus = !this.faqStatusFilter || faq.status === this.faqStatusFilter;
      const matchModule = !this.faqModuleFilter || faq.component === this.faqModuleFilter;
      return matchSearch && matchStatus && matchModule;
    });
  }

  // 辅助方法
  getIndexColor(i: number): string {
    const colors = ['blue', 'green', 'orange', 'pink', 'purple'];
    return colors[i % colors.length];
  }

  getIndexLabel(i: number): string {
    const labels = ['配', '1', '3', '1', '[', 'D'];
    return labels[i % labels.length];
  }

  getModuleColor(component: string): string {
    const lower = component.toLowerCase();
    if (lower.includes('table')) return 'blue';
    if (lower.includes('project')) return 'pink';
    if (lower.includes('backend')) return 'purple';
    if (lower.includes('other')) return 'gray';
    return 'blue';
  }

  getModuleShortName(component: string): string {
    const mod = this.allModules.find((m) => m.id === component);
    return mod ? mod.name : component;
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = { pending: '待处理', resolved: '已解决', processing: '处理中' };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getModuleCardColor(i: number): string {
    const colors = ['blue', 'pink', 'purple', 'gray', 'orange'];
    return colors[i % colors.length];
  }

  getModuleFaqCount(moduleId: string): number {
    return this.faqData.filter((f) => f.component === moduleId).length;
  }

  // 标签统计
  getTagUsageCount(tagName: string): number {
    return this.faqData.filter((f) => f.tags?.includes(tagName)).length;
  }

  getTotalTagUsage(): number {
    return this.faqData.reduce((sum, f) => sum + (f.tags?.length || 0), 0);
  }

  getMaxTagUsage(): number {
    const counts = this.tagData.map((t) => this.getTagUsageCount(t.name));
    return Math.max(0, ...counts);
  }

  getAvgTagUsage(): number {
    if (this.tagData.length === 0) return 0;
    return Math.round(this.getTotalTagUsage() / this.tagData.length);
  }

  // 版本相关
  getVersionFaqCount(versionName: string): number {
    return this.faqData.filter((f) => f.version === versionName).length;
  }

  getVersionStatus(ver: ConfigItem): string {
    // 简单逻辑：第一个版本是current，其他是维护中或已弃用
    const idx = this.versionData.indexOf(ver);
    if (idx === 0) return 'current';
    if (idx < 3) return 'maintenance';
    return 'deprecated';
  }

  getVersionStatusText(ver: ConfigItem, idx: number): string {
    if (idx === 0) return '当前版本';
    if (idx < 3) return '维护中';
    return '已弃用';
  }

  addTag() {
    if (!this.newTagName.trim()) return;
    this.configService.addTag(this.newTagName.trim()).subscribe({
      next: () => {
        this.messageService.success('添加成功');
        this.newTagName = '';
        this.loadData();
      },
      error: (err) => this.messageService.error('添加失败: ' + err.message),
    });
  }

  createFaq() {
    this.router.navigate(['/create']);
  }

  editFaq(faq: FaqItem) {
    this.router.navigate(['/edit', faq.id]);
  }

  async deleteFaq(faq: FaqItem) {
    const confirmed = await this.dialogService.confirm({
      title: '确认删除',
      message: `确定要删除问题 "${faq.title}" 吗？`,
      type: 'danger',
      confirmText: '删除',
    });
    if (!confirmed) return;
    this.faqService.delete(faq.id).subscribe({
      next: () => { this.messageService.success('删除成功'); this.loadFaqs(); },
      error: (err) => this.messageService.error('删除失败: ' + err.message),
    });
  }

  loadData() {
    this.configService.getModules().subscribe((modules) => {
      const flatModules: ConfigItem[] = [];
      modules.forEach((parent) => {
        if (parent.children) {
          parent.children.forEach((child) => {
            flatModules.push({ id: child.id, name: child.name, type: parent.name, parentId: parent.id, parentName: parent.name });
          });
        }
      });
      this.allModules = flatModules;
    });
    this.configService.getTags().subscribe((tags) => {
      this.tagData = tags.map((tag) => ({ id: tag, name: tag }));
    });
    this.configService.getVersions().subscribe((versions) => {
      this.versionData = versions.map((v) => ({ id: v.id, name: v.name, description: v.description }));
    });
  }

  showAddDialog(type: 'module' | 'tag' | 'version') {
    this.dialogType = type;
    this.editingItem = null;
    this.formData = {};
    this.showDialog = true;
  }

  editItem(type: 'module' | 'tag' | 'version', item: ConfigItem) {
    this.dialogType = type;
    this.editingItem = item;
    this.formData = { ...item };
    this.showDialog = true;
  }

  async deleteItem(type: 'module' | 'tag' | 'version', item: ConfigItem) {
    const confirmed = await this.dialogService.confirm({
      title: '确认删除', message: `确定要删除 "${item.name}" 吗？`, type: 'danger', confirmText: '删除',
    });
    if (!confirmed) return;

    const handler = {
      module: () => item.parentId ? this.configService.deleteModuleChild(item.parentId, item.id) : null,
      tag: () => this.configService.deleteTag(item.name),
      version: () => this.configService.deleteVersion(item.id),
    }[type]?.();
    
    handler?.subscribe({
      next: () => { this.messageService.success('删除成功'); this.loadData(); },
      error: (err: Error) => this.messageService.error('删除失败: ' + err.message),
    });
  }

  saveItem() {
    const handlers = { module: () => this.saveModule(), tag: () => this.saveTag(), version: () => this.saveVersion() };
    handlers[this.dialogType]();
  }

  private saveModule() {
    const onSuccess = () => {
      this.messageService.success(this.editingItem ? '更新成功' : '添加成功');
      this.closeDialog();
      this.loadData();
    };
    const onError = (err: Error) => this.messageService.error((this.editingItem ? '更新' : '添加') + '失败: ' + err.message);

    if (this.editingItem) {
      this.configService.updateModuleName(this.editingItem.id, this.formData.name || '', this.editingItem.parentId)
        .subscribe({ next: onSuccess, error: onError });
    } else if (this.formData.parentId) {
      this.configService.addModuleChild(this.formData.parentId, { id: this.formData.id || '', name: this.formData.name || '' })
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.configService.createModuleParent({ id: this.formData.id || '', name: this.formData.name || '' })
        .subscribe({ next: onSuccess, error: onError });
    }
  }

  private saveTag() {
    const obs = this.editingItem
      ? this.configService.updateTag(this.editingItem.name, this.formData.name || '')
      : this.configService.addTag(this.formData.name || '');
    obs.subscribe({
      next: () => { this.messageService.success(this.editingItem ? '更新成功' : '添加成功'); this.closeDialog(); this.loadData(); },
      error: (err) => this.messageService.error((this.editingItem ? '更新' : '添加') + '失败: ' + err.message),
    });
  }

  private saveVersion() {
    const data = { name: this.formData.name || '', description: this.formData.description || '' };
    const obs = this.editingItem ? this.configService.updateVersion(this.editingItem.id, data) : this.configService.addVersion(data);
    obs.subscribe({
      next: () => { this.messageService.success(this.editingItem ? '更新成功' : '添加成功'); this.closeDialog(); this.loadData(); },
      error: (err) => this.messageService.error((this.editingItem ? '更新' : '添加') + '失败: ' + err.message),
    });
  }

  closeDialog() {
    this.showDialog = false;
    this.editingItem = null;
    this.formData = {};
  }
}
