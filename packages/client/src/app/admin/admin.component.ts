import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  ButtonComponent,
  CardComponent,
  MessageService,
  DialogService,
} from '@repo/ui-lib';
import { ConfigService } from '../services/config.service';
import { FaqService } from '../services/faq.service';
import { FaqItem } from '../models';

interface ConfigItem {
  id: string;
  name: string;
  type?: string;
  parentId?: string; // For modules
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
  imports: [CommonModule, FormsModule, RouterModule, DataTableComponent, ButtonComponent, CardComponent],
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

  moduleData: ConfigItem[] = [];
  moduleColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: '名称' },
    { key: 'type', label: '类型', width: '150px' },
  ];
  moduleActions: TableAction[] = [
    { label: '编辑', type: 'primary', handler: (row) => this.editItem('module', row) },
    { label: '删除', type: 'danger', handler: (row) => this.deleteItem('module', row) },
  ];

  tagData: ConfigItem[] = [];
  tagColumns: TableColumn[] = [{ key: 'name', label: '标签名称' }];
  tagActions: TableAction[] = [
    { label: '编辑', type: 'primary', handler: (row) => this.editItem('tag', row) },
    { label: '删除', type: 'danger', handler: (row) => this.deleteItem('tag', row) },
  ];

  versionData: ConfigItem[] = [];
  versionColumns: TableColumn[] = [
    { key: 'name', label: '版本号' },
    { key: 'description', label: '描述' },
  ];
  versionActions: TableAction[] = [
    { label: '编辑', type: 'primary', handler: (row) => this.editItem('version', row) },
    { label: '删除', type: 'danger', handler: (row) => this.deleteItem('version', row) },
  ];

  faqData: FaqItem[] = [];
  faqColumns: TableColumn[] = [
    { key: 'title', label: '标题' },
    { key: 'component', label: '模块', width: '120px' },
    { key: 'status', label: '状态', width: '100px' },
    { key: 'views', label: '浏览', width: '80px' },
  ];
  faqActions: TableAction[] = [
    { label: '编辑', type: 'primary', handler: (row) => this.editFaq(row) },
    { label: '删除', type: 'danger', handler: (row) => this.deleteFaq(row) },
  ];

  ngOnInit() {
    this.loadData();
    this.loadFaqs();
  }

  get dialogTitle() {
    const titles = { module: '模块', tag: '标签', version: '版本' };
    return titles[this.dialogType];
  }

  loadFaqs() {
    this.faqService.getAll().subscribe((faqs) => (this.faqData = faqs));
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
            flatModules.push({ id: child.id, name: child.name, type: parent.name, parentId: parent.id });
          });
        }
      });
      this.moduleData = flatModules;
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
