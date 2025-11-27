import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaqService, AuthService } from '../services';
import { FaqItem, FlowchartData, FaqAttachment } from '../models';
import { TreeComponent, TreeNode, MessageService } from '@repo/ui-lib';
import { FlowchartBuilderComponent } from '../flowchart-builder/flowchart-builder.component';

@Component({
  selector: 'app-faq-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TreeComponent, FlowchartBuilderComponent],
  templateUrl: './faq-detail.component.html',
  styleUrls: ['./faq-detail.component.scss'],
})
export class FaqDetailComponent implements OnInit {
  faq?: FaqItem;
  flowchartData: FlowchartData | null = null;
  treeNodes: TreeNode[] = [];
  shareMenuOpen = false;
  showWechatModal = false;
  activeSection = 'section-phenomenon';
  previewAttachment: FaqAttachment | null = null;
  stepsExpanded = false;

  get phenomenonSteps(): string[] {
    if (!this.faq?.phenomenon) return [];
    return this.faq.phenomenon
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line) => line.length > 0);
  }

  get solutionLines(): string[] {
    if (!this.faq?.solution) return [];
    return this.faq.solution.split('\n').filter((line) => line.trim().length > 0);
  }

  isCodeLine(line: string): boolean {
    return (
      line.trim().startsWith('`') ||
      line.includes('=') ||
      line.includes('()') ||
      line.includes('->') ||
      line.includes('npm ') ||
      line.includes('pnpm ') ||
      line.includes('yarn ')
    );
  }

  /* eslint-disable @angular-eslint/prefer-inject */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private faqService: FaqService,
    public authService: AuthService,
    private messageService: MessageService
  ) {
    /* eslint-enable @angular-eslint/prefer-inject */
    if (typeof window !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.share-dropdown')) {
          this.shareMenuOpen = false;
        }
      });
    }
  }

  ngOnInit() {
    this.faqService.getAll().subscribe((faqs: FaqItem[]) => {
      this.buildNavTree(faqs);
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadFaq(id);
      }
    });

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.activeSection = entry.target.id;
            }
          });
        },
        { rootMargin: '-100px 0px -50% 0px' }
      );

      setTimeout(() => {
        const sections = document.querySelectorAll('#section-phenomenon, #section-flow, #section-solution');
        sections.forEach((section) => observer.observe(section));
      }, 500);
    }
  }

  loadFaq(id: string) {
    this.faqService.getById(id).subscribe((data: FaqItem) => {
      this.faq = data;
      this.faqService.update(id, { views: data.views + 1 }).subscribe();

      if (data.troubleshootingFlow) {
        try {
          this.flowchartData = JSON.parse(data.troubleshootingFlow);
        } catch {
          this.flowchartData = null;
        }
      } else {
        this.flowchartData = null;
      }
    });
  }

  buildNavTree(faqs: FaqItem[]) {
    const groups = new Map<string, FaqItem[]>();
    faqs.forEach((item) => {
      const comp = item.component || 'Other';
      if (!groups.has(comp)) {
        groups.set(comp, []);
      }
      groups.get(comp)?.push(item);
    });

    this.treeNodes = Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, items]) => ({
        id: name,
        label: name,
        expanded: true,
        count: items.length,
        children: items.map((item) => ({
          id: item.id,
          label: item.title,
          isLeaf: true,
          data: item,
        })),
      }));
  }

  onNodeClick(node: TreeNode) {
    if (node.isLeaf && node.data) {
      const item = node.data as FaqItem;
      this.router.navigate(['/detail', item.id]);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  toggleShareMenu() {
    this.shareMenuOpen = !this.shareMenuOpen;
  }

  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.messageService.success('链接已复制到剪贴板');
      this.shareMenuOpen = false;
    });
  }

  shareWechat() {
    this.shareMenuOpen = false;
    this.showWechatModal = true;
  }

  closeWechatModal() {
    this.showWechatModal = false;
  }

  scrollToSection(id: string) {
    this.activeSection = id;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openAttachmentPreview(attachment: FaqAttachment) {
    this.previewAttachment = attachment;
  }

  closeAttachmentPreview() {
    this.previewAttachment = null;
  }

  downloadAttachment(attachment: FaqAttachment) {
    const link = document.createElement('a');

    if (attachment.type === 'markdown' && attachment.content) {
      const blob = new Blob([attachment.content], { type: 'text/markdown' });
      link.href = URL.createObjectURL(blob);
    } else {
      link.href = attachment.url;
    }

    link.download = attachment.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (attachment.type === 'markdown' && attachment.content) {
      URL.revokeObjectURL(link.href);
    }

    this.messageService.success('开始下载: ' + attachment.name);
  }
}
