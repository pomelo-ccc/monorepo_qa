import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService, ConfigService } from '../services';
import { FaqItem, FlowchartData } from '../models';
import { ButtonComponent, CardComponent, SelectComponent, MessageService } from '@repo/ui-lib';
import { FlowchartBuilderComponent } from '../flowchart-builder/flowchart-builder.component';

@Component({
  selector: 'app-faq-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    SelectComponent,
    FlowchartBuilderComponent,
  ],
  templateUrl: './faq-edit.component.html',
  styleUrls: ['./faq-edit.component.scss'],
})
export class FaqEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private faqService = inject(FaqService);
  private configService = inject(ConfigService);
  private messageService = inject(MessageService);

  isEdit = false;
  faqId: string | null = null;
  faqData?: FaqItem;
  showFlowchart = true;
  flowchartData: FlowchartData = { nodes: [], connections: [] };

  attachments: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'markdown';
    url: string;
    file?: File;
    content?: string;
  }[] = [];
  private imageCount = 0;
  private videoCount = 0;
  private markdownCount = 0;

  previewAttachment: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'markdown';
    url: string;
    content?: string;
  } | null = null;
  currentPreviewIndex = 0;

  formData: Partial<FaqItem> & { tags: string[] } = {
    title: '',
    component: '',
    version: '',
    tags: [],
    summary: '',
    phenomenon: '1. ',
    solution: '',
    troubleshootingFlow: '',
  };

  moduleOptions: { label: string; value: string }[] = [];
  tagOptions: { label: string; value: string }[] = [];
  versionOptions: { label: string; value: string }[] = [];

  // 标签搜索和展开
  tagSearchQuery = '';
  showAllTags = false;

  ngOnInit() {
    this.loadConfigData();
    this.faqId = this.route.snapshot.paramMap.get('id');
    if (this.faqId) {
      this.isEdit = true;
      this.faqService.getById(this.faqId).subscribe((data) => {
        this.faqData = data;
        this.formData = { ...data, tags: data.tags || [] };
        if (data.troubleshootingFlow) {
          try {
            this.flowchartData = JSON.parse(data.troubleshootingFlow);
          } catch {
            this.flowchartData = { nodes: [], connections: [] };
          }
        }
        // 加载附件
        if (data.attachments && data.attachments.length > 0) {
          this.attachments = data.attachments.map((att) => ({
            id: att.id,
            name: att.name,
            type: att.type,
            url: att.url,
            content: att.content,
          }));
        }
      });
    }
  }

  onFlowchartChange(data: FlowchartData) {
    this.flowchartData = data;
    this.formData.troubleshootingFlow = JSON.stringify(data);
  }

  private loadConfigData() {
    this.configService.getModuleOptions().subscribe((options) => (this.moduleOptions = options));
    this.configService.getTagOptions().subscribe((options) => (this.tagOptions = options));
    this.configService.getVersionOptions().subscribe((options) => (this.versionOptions = options));
  }

  isTagSelected(tag: string): boolean {
    return this.formData.tags.includes(tag);
  }

  toggleTag(tag: string) {
    const index = this.formData.tags.indexOf(tag);
    if (index > -1) {
      this.formData.tags.splice(index, 1);
    } else {
      this.formData.tags.push(tag);
    }
  }

  clearAllTags() {
    this.formData.tags = [];
  }

  getFilteredTags() {
    if (!this.tagSearchQuery.trim()) {
      return this.tagOptions.filter((t) => !this.isTagSelected(t.value));
    }
    const query = this.tagSearchQuery.toLowerCase();
    return this.tagOptions.filter(
      (t) => !this.isTagSelected(t.value) && t.label.toLowerCase().includes(query)
    );
  }

  onStepsKeydown(event: KeyboardEvent) {
    const textarea = event.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;

    // 阻止删除第一个序号 "1. "
    if ((event.key === 'Backspace' || event.key === 'Delete') && cursorPos <= 3) {
      const value = textarea.value;
      if (value.startsWith('1. ') && cursorPos <= 3) {
        event.preventDefault();
        return;
      }
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const value = textarea.value;
      const cursorPos = textarea.selectionStart;
      const beforeCursor = value.substring(0, cursorPos);
      const afterCursor = value.substring(cursorPos);

      // 获取当前行号
      const linesBefore = beforeCursor.split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];
      const match = currentLine.match(/^(\d+)\.\s*/);

      let nextNumber = 1;
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      } else {
        for (let i = linesBefore.length - 1; i >= 0; i--) {
          const lineMatch = linesBefore[i].match(/^(\d+)\.\s*/);
          if (lineMatch) {
            nextNumber = parseInt(lineMatch[1], 10) + 1;
            break;
          }
        }
      }

      // 重新编号后续行
      const linesAfter = afterCursor.split('\n');
      const renumberedAfter = linesAfter.map((line, index) => {
        if (index === 0) return line; // 第一段是当前行剩余部分，不处理
        const lineMatch = line.match(/^(\d+)\.\s*/);
        if (lineMatch) {
          const newNum = nextNumber + index;
          return line.replace(/^\d+\./, `${newNum}.`);
        }
        return line;
      }).join('\n');

      const newLine = `\n${nextNumber}. `;
      this.formData.phenomenon = beforeCursor + newLine + renumberedAfter;

      setTimeout(() => {
        const newPos = cursorPos + newLine.length;
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      });
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isMarkdown =
        file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown';

      if (!isImage && !isVideo && !isMarkdown) return;

      const type: 'image' | 'video' | 'markdown' = isImage ? 'image' : isVideo ? 'video' : 'markdown';
      let name: string;

      if (isImage) {
        name = `图 ${++this.imageCount}`;
      } else if (isVideo) {
        name = `视频 ${++this.videoCount}`;
      } else {
        ++this.markdownCount;
        name = file.name;
      }

      const url = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      if (isMarkdown) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          this.attachments.push({ id, name, type, url, file, content });
        };
        reader.readAsText(file);
      } else {
        this.attachments.push({ id, name, type, url, file });
      }
    });

    input.value = '';
  }

  removeAttachment(index: number) {
    const attachment = this.attachments[index];
    if (attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    this.attachments.splice(index, 1);
  }

  openPreview(attachment: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'markdown';
    url: string;
    content?: string;
  }) {
    this.previewAttachment = attachment;
    this.currentPreviewIndex = this.attachments.findIndex((a) => a.id === attachment.id);
  }

  closePreview() {
    this.previewAttachment = null;
  }

  prevPreview() {
    if (this.currentPreviewIndex > 0) {
      this.currentPreviewIndex--;
      this.previewAttachment = this.attachments[this.currentPreviewIndex];
    }
  }

  nextPreview() {
    if (this.currentPreviewIndex < this.attachments.length - 1) {
      this.currentPreviewIndex++;
      this.previewAttachment = this.attachments[this.currentPreviewIndex];
    }
  }

  toggleFlowchart() {
    this.showFlowchart = !this.showFlowchart;
  }

  
  onSave() {
    if (
      !this.formData.title ||
      !this.formData.component ||
      !this.formData.tags.length ||
      !this.formData.summary ||
      !this.formData.phenomenon ||
      !this.formData.solution
    ) {
      this.messageService.warning('请填写所有必填字段');
      return;
    }

    const errorCode = this.generateErrorCode(this.formData.component || '', this.formData.tags);
    const faqData: Partial<FaqItem> = {
      ...this.formData,
      errorCode,
      views: this.faqData?.views || 0,
      solveTimeMinutes: this.faqData?.solveTimeMinutes || 0,
    };

    if (this.isEdit && this.faqId) {
      this.faqService.update(this.faqId, faqData).subscribe(() => {
        this.router.navigate(['/detail', this.faqId]);
      });
    } else {
      this.faqService.create(faqData).subscribe((newFaq) => {
        if (newFaq?.id) {
          this.router.navigate(['/detail', newFaq.id]);
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }

  private generateErrorCode(module: string, tags: string[]): string {
    const modulePrefix = module.toUpperCase().substring(0, 3);
    const tagPrefix = tags.length > 0 ? tags[0].substring(0, 3).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString().slice(-4);
    return `${modulePrefix}_${tagPrefix}_${timestamp}`;
  }

  onCancel() {
    if (this.isEdit && this.faqId) {
      this.router.navigate(['/detail', this.faqId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
