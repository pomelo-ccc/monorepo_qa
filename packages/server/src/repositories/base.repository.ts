import { DATA_FILES, readJsonFile, writeJsonFile, fileExists } from '../utils/file.util';

/**
 * 基础 Repository 接口
 */
export interface IRepository<T> {
  findAll(): Promise<T[]>;
  save(data: T[]): Promise<void>;
}

/**
 * JSON 文件 Repository 基类
 */
export abstract class JsonRepository<T> implements IRepository<T> {
  constructor(protected readonly dataFile: string) {}

  async findAll(): Promise<T[]> {
    return readJsonFile<T[]>(this.dataFile, []);
  }

  async save(data: T[]): Promise<void> {
    await writeJsonFile(this.dataFile, data);
  }

  async exists(): Promise<boolean> {
    return fileExists(this.dataFile);
  }
}

export { DATA_FILES };
