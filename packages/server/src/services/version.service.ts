import { DATA_FILES, readJsonFile, writeJsonFile, fileExists } from '../utils/file.util';

export interface Version {
  id: string;
  name: string;
  description?: string;
  createTime: string;
}

/**
 * 版本服务 - 处理版本的增删改查
 */
export class VersionService {
  /**
   * 获取所有版本
   */
  async getAll(): Promise<Version[]> {
    return readJsonFile<Version[]>(DATA_FILES.versions, []);
  }

  /**
   * 添加版本
   */
  async add(data: { name: string; description?: string }): Promise<Version> {
    const versions = await this.getAll();

    if (versions.some((v) => v.name === data.name)) {
      throw new Error('版本已存在');
    }

    const newVersion: Version = {
      id: `ver-${Date.now()}`,
      name: data.name,
      description: data.description,
      createTime: new Date().toISOString(),
    };

    versions.unshift(newVersion);
    await writeJsonFile(DATA_FILES.versions, versions);

    return newVersion;
  }

  /**
   * 更新版本
   */
  async update(id: string, data: Partial<Version>): Promise<Version | null> {
    const versions = await this.getAll();
    const index = versions.findIndex((v) => v.id === id);

    if (index === -1) {
      return null;
    }

    versions[index] = {
      ...versions[index],
      ...data,
      id, // 确保 ID 不被覆盖
    };

    await writeJsonFile(DATA_FILES.versions, versions);
    return versions[index];
  }

  /**
   * 删除版本
   */
  async delete(id: string): Promise<boolean> {
    const versions = await this.getAll();
    const filtered = versions.filter((v) => v.id !== id);

    if (filtered.length === versions.length) {
      return false;
    }

    await writeJsonFile(DATA_FILES.versions, filtered);
    return true;
  }

  /**
   * 初始化默认版本数据
   */
  async initDefault(): Promise<void> {
    const exists = await fileExists(DATA_FILES.versions);
    if (!exists) {
      const defaultVersions: Version[] = [
        { id: 'ver-1', name: '1.0.x', description: '初始版本', createTime: new Date().toISOString() },
        { id: 'ver-2', name: '1.1.x', description: '功能更新', createTime: new Date().toISOString() },
        { id: 'ver-3', name: '1.2.x', description: '性能优化', createTime: new Date().toISOString() },
        { id: 'ver-4', name: '2.0.x', description: '重大更新', createTime: new Date().toISOString() },
      ];
      await writeJsonFile(DATA_FILES.versions, defaultVersions);
    }
  }
}

export const versionService = new VersionService();
