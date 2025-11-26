import { Version, VersionRepository, versionRepository } from '../repositories';

// 重新导出 Version 类型供外部使用
export { Version };

/**
 * 版本服务 - 处理版本业务逻辑
 */
export class VersionService {
  constructor(private readonly repo: VersionRepository = versionRepository) {}

  /**
   * 获取所有版本
   */
  async getAll(): Promise<Version[]> {
    return this.repo.findAll();
  }

  /**
   * 添加版本
   */
  async add(data: { name: string; description?: string }): Promise<Version> {
    const existing = await this.repo.findByName(data.name);
    if (existing) {
      throw new Error('版本已存在');
    }

    const newVersion: Version = {
      id: `ver-${Date.now()}`,
      name: data.name,
      description: data.description,
      createTime: new Date().toISOString(),
    };

    const versions = await this.repo.findAll();
    versions.unshift(newVersion);
    await this.repo.save(versions);

    return newVersion;
  }

  /**
   * 更新版本
   */
  async update(id: string, data: Partial<Version>): Promise<Version | null> {
    const versions = await this.repo.findAll();
    const index = versions.findIndex((v) => v.id === id);

    if (index === -1) {
      return null;
    }

    versions[index] = {
      ...versions[index],
      ...data,
      id, // 确保 ID 不被覆盖
    };

    await this.repo.save(versions);
    return versions[index];
  }

  /**
   * 删除版本
   */
  async delete(id: string): Promise<boolean> {
    const versions = await this.repo.findAll();
    const filtered = versions.filter((v) => v.id !== id);

    if (filtered.length === versions.length) {
      return false;
    }

    await this.repo.save(filtered);
    return true;
  }

  /**
   * 初始化默认版本数据
   */
  async initDefault(): Promise<void> {
    const exists = await this.repo.exists();
    if (!exists) {
      const defaultVersions: Version[] = [
        { id: 'ver-1', name: '1.0.x', description: '初始版本', createTime: new Date().toISOString() },
        { id: 'ver-2', name: '1.1.x', description: '功能更新', createTime: new Date().toISOString() },
        { id: 'ver-3', name: '1.2.x', description: '性能优化', createTime: new Date().toISOString() },
        { id: 'ver-4', name: '2.0.x', description: '重大更新', createTime: new Date().toISOString() },
      ];
      await this.repo.save(defaultVersions);
    }
  }
}

export const versionService = new VersionService();
