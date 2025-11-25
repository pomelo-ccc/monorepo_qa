import { DATA_FILES, readJsonFile, writeJsonFile } from '../utils/file.util';
import { faqService } from './faq.service';

/**
 * 标签服务 - 处理标签的增删改查
 */
export class TagService {
  /**
   * 获取所有标签
   */
  async getAll(): Promise<string[]> {
    return readJsonFile<string[]>(DATA_FILES.tags, []);
  }

  /**
   * 添加标签
   */
  async add(tag: string): Promise<string[]> {
    const tags = await this.getAll();

    if (tags.includes(tag)) {
      throw new Error('标签已存在');
    }

    tags.push(tag);
    await writeJsonFile(DATA_FILES.tags, tags);

    return tags;
  }

  /**
   * 批量添加标签
   */
  async addMany(newTags: string[]): Promise<string[]> {
    const tags = await this.getAll();
    const added: string[] = [];

    newTags.forEach((tag) => {
      if (!tags.includes(tag)) {
        tags.push(tag);
        added.push(tag);
      }
    });

    if (added.length > 0) {
      await writeJsonFile(DATA_FILES.tags, tags);
    }

    return tags;
  }

  /**
   * 更新标签名称
   */
  async update(oldTag: string, newTag: string): Promise<string[]> {
    const tags = await this.getAll();
    const index = tags.indexOf(oldTag);

    if (index === -1) {
      throw new Error('标签不存在');
    }

    if (tags.includes(newTag)) {
      throw new Error('新标签名已存在');
    }

    tags[index] = newTag;
    await writeJsonFile(DATA_FILES.tags, tags);

    // 同步更新所有 FAQ 中的标签
    await faqService.updateTagInAllFaqs(oldTag, newTag);

    return tags;
  }

  /**
   * 删除标签
   */
  async delete(tag: string): Promise<string[]> {
    const tags = await this.getAll();
    const filtered = tags.filter((t) => t !== tag);

    await writeJsonFile(DATA_FILES.tags, filtered);

    return filtered;
  }

  /**
   * 检查标签是否存在
   */
  async exists(tag: string): Promise<boolean> {
    const tags = await this.getAll();
    return tags.includes(tag);
  }

  /**
   * 获取标签使用统计
   */
  async getStats(): Promise<{ tag: string; count: number }[]> {
    const tags = await this.getAll();
    const faqs = await faqService.getAll();

    const stats = tags.map((tag) => ({
      tag,
      count: faqs.filter((f) => f.tags.includes(tag)).length,
    }));

    return stats.sort((a, b) => b.count - a.count);
  }
}

export const tagService = new TagService();
