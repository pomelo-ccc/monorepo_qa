import { FaqItem } from '../models';
import { DATA_FILES, readJsonFile, writeJsonFile } from '../utils/file.util';

/**
 * FAQ 服务 - 处理问题的增删改查
 */
export class FaqService {
  /**
   * 获取所有 FAQ
   */
  async getAll(): Promise<FaqItem[]> {
    return readJsonFile<FaqItem[]>(DATA_FILES.faqs, []);
  }

  /**
   * 根据 ID 获取单个 FAQ
   */
  async getById(id: string): Promise<FaqItem | undefined> {
    const faqs = await this.getAll();
    return faqs.find((f) => f.id === id);
  }

  /**
   * 创建新 FAQ
   */
  async create(data: Partial<FaqItem>): Promise<FaqItem> {
    const faqs = await this.getAll();

    const newFaq: FaqItem = {
      id: data.id || `faq-${Date.now()}`,
      title: data.title || '',
      component: data.component || '',
      version: data.version || '1.0.0',
      tags: data.tags || [],
      errorCode: data.errorCode,
      summary: data.summary || '',
      phenomenon: data.phenomenon || '',
      solution: data.solution || '',
      troubleshootingFlow: data.troubleshootingFlow || '',
      validationMethod: data.validationMethod || '',
      views: data.views || 0,
      solveTimeMinutes: data.solveTimeMinutes || 0,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      author: data.author || 'admin',
      status: data.status || 'pending',
    } as FaqItem;

    faqs.unshift(newFaq);
    await writeJsonFile(DATA_FILES.faqs, faqs);

    return newFaq;
  }

  /**
   * 更新 FAQ
   */
  async update(id: string, data: Partial<FaqItem>): Promise<FaqItem | null> {
    const faqs = await this.getAll();
    const index = faqs.findIndex((f) => f.id === id);

    if (index === -1) {
      return null;
    }

    faqs[index] = {
      ...faqs[index],
      ...data,
      id, // 确保 ID 不被覆盖
      updateTime: new Date().toISOString(),
    } as FaqItem;

    await writeJsonFile(DATA_FILES.faqs, faqs);
    return faqs[index];
  }

  /**
   * 删除 FAQ
   */
  async delete(id: string): Promise<boolean> {
    const faqs = await this.getAll();
    const filtered = faqs.filter((f) => f.id !== id);

    if (filtered.length === faqs.length) {
      return false; // 没有找到要删除的项
    }

    await writeJsonFile(DATA_FILES.faqs, filtered);
    return true;
  }

  /**
   * 搜索 FAQ
   */
  async search(query: {
    keyword?: string;
    component?: string;
    tags?: string[];
    status?: string;
  }): Promise<FaqItem[]> {
    let faqs = await this.getAll();

    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      faqs = faqs.filter(
        (f) =>
          f.title.toLowerCase().includes(kw) ||
          f.summary.toLowerCase().includes(kw) ||
          f.errorCode?.toLowerCase().includes(kw),
      );
    }

    if (query.component) {
      faqs = faqs.filter((f) => f.component === query.component);
    }

    if (query.tags && query.tags.length > 0) {
      faqs = faqs.filter((f) => query.tags!.some((tag) => f.tags.includes(tag)));
    }

    if (query.status) {
      faqs = faqs.filter((f) => f.status === query.status);
    }

    return faqs;
  }

  /**
   * 增加浏览量
   */
  async incrementViews(id: string): Promise<void> {
    const faqs = await this.getAll();
    const faq = faqs.find((f) => f.id === id);

    if (faq) {
      faq.views = (faq.views || 0) + 1;
      await writeJsonFile(DATA_FILES.faqs, faqs);
    }
  }

  /**
   * 批量更新标签（当标签重命名时）
   */
  async updateTagInAllFaqs(oldTag: string, newTag: string): Promise<number> {
    const faqs = await this.getAll();
    let count = 0;

    faqs.forEach((faq) => {
      if (faq.tags && faq.tags.includes(oldTag)) {
        faq.tags = faq.tags.map((t) => (t === oldTag ? newTag : t));
        count++;
      }
    });

    if (count > 0) {
      await writeJsonFile(DATA_FILES.faqs, faqs);
    }

    return count;
  }
}

export const faqService = new FaqService();
