import { ModuleNode, ModuleChild } from '../models';
import { DATA_FILES, readJsonFile, writeJsonFile } from '../utils/file.util';

/**
 * 模块服务 - 处理模块的增删改查
 */
export class ModuleService {
  /**
   * 获取所有模块
   */
  async getAll(): Promise<ModuleNode[]> {
    return readJsonFile<ModuleNode[]>(DATA_FILES.modules, []);
  }

  /**
   * 根据 ID 获取模块
   */
  async getById(id: string): Promise<ModuleNode | undefined> {
    const modules = await this.getAll();
    return modules.find((m) => m.id === id);
  }

  /**
   * 创建顶级模块
   */
  async createParent(data: { id: string; name: string }): Promise<ModuleNode> {
    const modules = await this.getAll();

    if (modules.some((m) => m.id === data.id)) {
      throw new Error('模块 ID 已存在');
    }

    const newModule: ModuleNode = {
      id: data.id,
      name: data.name,
      children: [],
    };

    modules.push(newModule);
    await writeJsonFile(DATA_FILES.modules, modules);

    return newModule;
  }

  /**
   * 添加子模块
   */
  async addChild(parentId: string, child: ModuleChild): Promise<ModuleNode | null> {
    const modules = await this.getAll();
    const parent = modules.find((m) => m.id === parentId);

    if (!parent) {
      return null;
    }

    if (!parent.children) {
      parent.children = [];
    }

    if (parent.children.some((c) => c.id === child.id)) {
      throw new Error('子模块 ID 已存在');
    }

    parent.children.push(child);
    await writeJsonFile(DATA_FILES.modules, modules);

    return parent;
  }

  /**
   * 更新模块名称
   */
  async updateName(id: string, name: string, parentId?: string): Promise<boolean> {
    const modules = await this.getAll();

    if (parentId) {
      // 更新子模块
      const parent = modules.find((m) => m.id === parentId);
      if (parent && parent.children) {
        const child = parent.children.find((c) => c.id === id);
        if (child) {
          child.name = name;
          await writeJsonFile(DATA_FILES.modules, modules);
          return true;
        }
      }
    } else {
      // 更新顶级模块
      const module = modules.find((m) => m.id === id);
      if (module) {
        module.name = name;
        await writeJsonFile(DATA_FILES.modules, modules);
        return true;
      }
    }

    return false;
  }

  /**
   * 删除子模块
   */
  async deleteChild(parentId: string, childId: string): Promise<boolean> {
    const modules = await this.getAll();
    const parent = modules.find((m) => m.id === parentId);

    if (parent && parent.children) {
      const index = parent.children.findIndex((c) => c.id === childId);
      if (index > -1) {
        parent.children.splice(index, 1);
        await writeJsonFile(DATA_FILES.modules, modules);
        return true;
      }
    }

    return false;
  }

  /**
   * 删除顶级模块（包括所有子模块）
   */
  async deleteParent(id: string): Promise<boolean> {
    const modules = await this.getAll();
    const index = modules.findIndex((m) => m.id === id);

    if (index > -1) {
      modules.splice(index, 1);
      await writeJsonFile(DATA_FILES.modules, modules);
      return true;
    }

    return false;
  }

  /**
   * 批量保存模块（用于排序、结构调整）
   */
  async saveAll(modules: ModuleNode[]): Promise<void> {
    await writeJsonFile(DATA_FILES.modules, modules);
  }

  /**
   * 获取扁平化的模块列表（用于下拉选择）
   */
  async getFlatList(): Promise<{ id: string; name: string; parentId?: string; parentName?: string }[]> {
    const modules = await this.getAll();
    const result: { id: string; name: string; parentId?: string; parentName?: string }[] = [];

    modules.forEach((parent) => {
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach((child) => {
          result.push({
            id: child.id,
            name: child.name,
            parentId: parent.id,
            parentName: parent.name,
          });
        });
      }
    });

    return result;
  }
}

export const moduleService = new ModuleService();
