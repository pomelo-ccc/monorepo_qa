import { JsonRepository, DATA_FILES } from './base.repository';

export interface Version {
  id: string;
  name: string;
  description?: string;
  createTime: string;
}

/**
 * 版本数据访问层
 */
export class VersionRepository extends JsonRepository<Version> {
  constructor() {
    super(DATA_FILES.versions);
  }

  async findById(id: string): Promise<Version | undefined> {
    const versions = await this.findAll();
    return versions.find((v) => v.id === id);
  }

  async findByName(name: string): Promise<Version | undefined> {
    const versions = await this.findAll();
    return versions.find((v) => v.name === name);
  }
}

export const versionRepository = new VersionRepository();
