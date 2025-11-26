import { TagRepository, tagRepository } from '../repositories';
import { faqService } from './faq.service';

/**
 * 标签服务 - 处理标签业务逻辑
 */
export class TagService {
  constructor(private readonly repo: TagRepository = tagRepository) {}

  /**
   * 获取所有标签
   */
  async getAll(): Promise<string[]> {
    return this.repo.findAll();
  }

  /**
   * 添加标签
   */
  async add(tag: string): Promise<string[]> {
    const exists = await this.repo.exists(tag);
    if (exists) {
      throw new Error('标签已存在');
    }

    const tags = await this.repo.findAll();
    tags.push(tag);
    await this.repo.save(tags);

    return tags;
  }

  /**
   * 批量添加标签
   */
  async addMany(newTags: string[]): Promise<string[]> {
    const tags = await this.repo.findAll();
    const added: string[] = [];

    newTags.forEach((tag) => {
      if (!tags.includes(tag)) {
        tags.push(tag);
        added.push(tag);
      }
    });

    if (added.length > 0) {
      await this.repo.save(tags);
    }

    return tags;
  }

  /**
   * 更新标签名称
   */
  async update(oldTag: string, newTag: string): Promise<string[]> {
    const tags = await this.repo.findAll();
    const index = tags.indexOf(oldTag);

    if (index === -1) {
      throw new Error('标签不存在');
    }

    if (tags.includes(newTag)) {
      throw new Error('新标签名已存在');
    }

    tags[index] = newTag;
    await this.repo.save(tags);

    // 同步更新所有 FAQ 中的标签
    await faqService.updateTagInAllFaqs(oldTag, newTag);

    return tags;
  }

  /**
   * 删除标签
   */
  async delete(tag: string): Promise<string[]> {
    const tags = await this.repo.findAll();
    const filtered = tags.filter((t) => t !== tag);
    await this.repo.save(filtered);
    return filtered;
  }

  /**
   * 检查标签是否存在
   */
  async exists(tag: string): Promise<boolean> {
    return this.repo.exists(tag);
  }

  /**
   * 获取标签使用统计
   */
  async getStats(): Promise<{ tag: string; count: number }[]> {
    const tags = await this.repo.findAll();
    const faqs = await faqService.getAll();

    const stats = tags.map((tag) => ({
      tag,
      count: faqs.filter((f) => f.tags.includes(tag)).length,
    }));

    return stats.sort((a, b) => b.count - a.count);
  }
}

export const tagService = new TagService();
