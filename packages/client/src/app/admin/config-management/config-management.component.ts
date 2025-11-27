import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { ModuleNode, ModuleChild, Version } from '../../models';
import { Router, RouterModule } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  TableColumn,
  TableAction,
  MessageService,
  DialogComponent,
} from '@repo/ui-lib';

interface FlatModule {
  id: string;
  name: string;
  type: string;
  parentId: string;
  original: ModuleNode;
  parentOriginal: ModuleNode;
}

@Component({
  selector: 'app-config-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    DialogComponent,
  ],
  templateUrl: './config-management.component.html',
  styleUrls: ['./config-management.component.scss'],
})
export class ConfigManagementComponent implements OnInit {
  private messageService = inject(MessageService);

  activeTab: 'modules' | 'tags' | 'versions' | 'files' = 'modules';

  // Modules Data
  modules: ModuleNode[] = [];
  modulesChanged = false;

  moduleColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: 200 },
    { key: 'name', label: '名称', width: 200 },
    { key: 'type', label: '类型', width: 150 },
  ];

  moduleActions: TableAction[] = [];
  versionActions: TableAction[] = [];

  // Tags Data
  tags: string[] = [];
  newTagName = '';
  editingTag: string | null = null;
  editTagName = '';

  // Versions Data
  versions: Version[] = [];
  versionColumns: TableColumn[] = [
    { key: 'name', label: '版本号', width: 150 },
    { key: 'description', label: '描述', width: 300 },
    {
      key: 'createTime',
      label: '创建时间',
      width: 200,
      formatter: (val: string) => new Date(val).toLocaleString(),
    },
  ];

  // Dialog States
  confirmDialog = {
    visible: false,
    title: '',
    message: '',
    onConfirm: () => void 0,
  };

  moduleDialog = {
    visible: false,
    isEdit: false,
    data: { id: '', name: '', parentId: '' },
  };

  versionDialog = {
    visible: false,
    isEdit: false,
    data: { id: '', name: '', description: '' },
  };

  batchVersionDialog = {
    visible: false,
    text: '',
  };

  /* eslint-disable @angular-eslint/prefer-inject */
  constructor(
    private configService: ConfigService,
    private router: Router,
  ) {}
  /* eslint-enable @angular-eslint/prefer-inject */

  ngOnInit() {
    this.initActions();
    this.loadModules();
    this.loadTags();
    this.loadVersions();
  }

  initActions() {
    this.moduleActions = [
      { label: '编辑', type: 'primary', handler: (row) => this.openEditModuleDialog(row) },
      { label: '删除', type: 'danger', handler: (row) => this.deleteModuleItem(row) },
    ];
    this.versionActions = [
      { label: '编辑', type: 'primary', handler: (row) => this.openEditVersionDialog(row) },
      { label: '删除', type: 'danger', handler: (row) => this.deleteVersion(row) },
    ];
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // --- Modules Logic ---
  loadModules() {
    this.configService.getModules().subscribe((data) => {
      this.modules = data;
      this.modulesChanged = false;
    });
  }

  get flatModules(): FlatModule[] {
    const result: FlatModule[] = [];
    this.modules.forEach((parent) => {
      if (parent.children) {
        parent.children.forEach((child: ModuleChild) => {
          result.push({
            id: child.id,
            name: child.name,
            type: parent.name,
            parentId: parent.id,
            original: child,
            parentOriginal: parent,
          });
        });
      }
    });
    return result;
  }

  // Module Dialogs
  openAddModuleDialog() {
    this.moduleDialog = {
      visible: true,
      isEdit: false,
      data: { id: '', name: '', parentId: '' },
    };
  }

  openEditModuleDialog(row: FlatModule) {
    this.moduleDialog = {
      visible: true,
      isEdit: true,
      data: {
        id: row.id,
        name: row.name,
        parentId: row.parentId,
      },
    };
  }

  closeModuleDialog() {
    this.moduleDialog.visible = false;
  }

  saveModule() {
    const { id, name, parentId } = this.moduleDialog.data;
    if (!id || !name) {
      this.messageService.warning('请填写模块ID和名称');
      return;
    }

    if (this.moduleDialog.isEdit) {
      this.updateModule(id, name, parentId);
    } else {
      this.addModule(id, name, parentId);
    }
    this.closeModuleDialog();
  }

  private addModule(id: string, name: string, parentId: string) {
    if (parentId) {
      const parent = this.modules.find((m) => m.id === parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push({ id, name });
      }
    } else {
      this.modules.push({ id, name, children: [] });
    }
    this.saveModulesToServer();
  }

  private updateModule(id: string, name: string, parentId: string) {
    const parent = this.modules.find((m) => m.id === parentId);
    if (parent?.children) {
      const child = parent.children.find((c) => c.id === id);
      if (child) child.name = name;
    }
    this.saveModulesToServer();
  }

  deleteModuleItem(row: FlatModule) {
    this.confirmDialog = {
      visible: true,
      title: '删除模块',
      message: `确定要删除模块 "${row.name}" 吗？`,
      onConfirm: () => {
        const parent = this.modules.find((m) => m.id === row.parentId);
        if (parent?.children) {
          parent.children = parent.children.filter((c) => c.id !== row.id);
        }
        this.saveModulesToServer();
        this.closeConfirmDialog();
      },
    };
  }

  private saveModulesToServer() {
    this.configService.saveModules(this.modules).subscribe({
      next: () => this.messageService.success('模块保存成功'),
      error: () => this.messageService.error('模块保存失败'),
    });
  }

  // --- Tags Logic ---
  loadTags() {
    this.configService.getTags().subscribe((data) => (this.tags = data));
  }

  addTag() {
    if (!this.newTagName.trim()) return;
    if (this.tags.includes(this.newTagName.trim())) {
      this.messageService.warning('标签已存在');
      return;
    }
    this.tags.push(this.newTagName.trim());
    this.saveTagsToServer();
    this.newTagName = '';
  }

  startEditTag(tag: string) {
    this.editingTag = tag;
    this.editTagName = tag;
  }

  cancelEditTag() {
    this.editingTag = null;
    this.editTagName = '';
  }

  saveTagEdit() {
    if (!this.editTagName.trim() || !this.editingTag) return;
    const index = this.tags.indexOf(this.editingTag);
    if (index > -1) {
      this.tags[index] = this.editTagName.trim();
      this.saveTagsToServer();
    }
    this.cancelEditTag();
  }

  deleteTag(tag: string) {
    this.confirmDialog = {
      visible: true,
      title: '删除标签',
      message: `确定要删除标签 "${tag}" 吗？`,
      onConfirm: () => {
        this.tags = this.tags.filter((t) => t !== tag);
        this.saveTagsToServer();
        this.closeConfirmDialog();
      },
    };
  }

  private saveTagsToServer() {
    this.configService.saveTags(this.tags).subscribe({
      next: () => this.messageService.success('标签保存成功'),
      error: () => this.messageService.error('标签保存失败'),
    });
  }

  // --- Versions Logic ---
  loadVersions() {
    this.configService.getVersions().subscribe((data) => (this.versions = data));
  }

  openAddVersionDialog() {
    this.versionDialog = {
      visible: true,
      isEdit: false,
      data: { id: '', name: '', description: '' },
    };
  }

  openEditVersionDialog(row: Version) {
    this.versionDialog = {
      visible: true,
      isEdit: true,
      data: { id: row.id || '', name: row.name, description: row.description || '' },
    };
  }

  closeVersionDialog() {
    this.versionDialog.visible = false;
  }

  saveVersion() {
    const { name, description } = this.versionDialog.data;
    if (!name.trim()) {
      this.messageService.warning('请填写版本号');
      return;
    }

    if (this.versionDialog.isEdit) {
      const version = this.versions.find((v) => v.id === this.versionDialog.data.id);
      if (version) {
        version.name = name;
        version.description = description;
      }
    } else {
      this.versions.push({
        id: `v_${Date.now()}`,
        name,
        description,
        createTime: new Date().toISOString(),
      });
    }
    this.saveVersionsToServer();
    this.closeVersionDialog();
  }

  deleteVersion(row: Version) {
    this.confirmDialog = {
      visible: true,
      title: '删除版本',
      message: `确定要删除版本 "${row.name}" 吗？`,
      onConfirm: () => {
        this.versions = this.versions.filter((v) => v.id !== row.id);
        this.saveVersionsToServer();
        this.closeConfirmDialog();
      },
    };
  }

  openBatchAddVersionDialog() {
    this.batchVersionDialog = { visible: true, text: '' };
  }

  closeBatchVersionDialog() {
    this.batchVersionDialog.visible = false;
  }

  saveBatchVersions() {
    const lines = this.batchVersionDialog.text.split('\n').filter((l) => l.trim());
    if (lines.length === 0) {
      this.messageService.warning('请输入版本号');
      return;
    }
    lines.forEach((line) => {
      this.versions.push({
        id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: line.trim(),
        description: '',
        createTime: new Date().toISOString(),
      });
    });
    this.saveVersionsToServer();
    this.closeBatchVersionDialog();
  }

  private saveVersionsToServer() {
    this.configService.updateVersions(this.versions).subscribe({
      next: () => this.messageService.success('版本保存成功'),
      error: () => this.messageService.error('版本保存失败'),
    });
  }

  // --- Confirm Dialog ---
  closeConfirmDialog() {
    this.confirmDialog.visible = false;
  }

  onConfirmDialog() {
    this.confirmDialog.onConfirm();
  }
}

