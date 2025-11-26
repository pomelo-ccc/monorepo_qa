import { ModuleNode } from '../models';
import { JsonRepository, DATA_FILES } from './base.repository';

/**
 * 模块数据访问层
 */
export class ModuleRepository extends JsonRepository<ModuleNode> {
  constructor() {
    super(DATA_FILES.modules);
  }

  async findById(id: string): Promise<ModuleNode | undefined> {
    const modules = await this.findAll();
    return modules.find((m) => m.id === id);
  }
}

export const moduleRepository = new ModuleRepository();
