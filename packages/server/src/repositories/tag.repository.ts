import { readJsonFile, writeJsonFile, DATA_FILES } from '../utils/file.util';

/**
 * 标签数据访问层
 * 标签是简单的字符串数组，不继承 JsonRepository
 */
export class TagRepository {
  async findAll(): Promise<string[]> {
    return readJsonFile<string[]>(DATA_FILES.tags, []);
  }

  async save(tags: string[]): Promise<void> {
    await writeJsonFile(DATA_FILES.tags, tags);
  }

  async exists(tag: string): Promise<boolean> {
    const tags = await this.findAll();
    return tags.includes(tag);
  }
}

export const tagRepository = new TagRepository();
