import * as fs from 'fs/promises';
import * as path from 'path';

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../../data');

export const DATA_FILES = {
  faqs: path.join(DATA_DIR, 'faqs.json'),
  modules: path.join(DATA_DIR, 'modules.json'),
  tags: path.join(DATA_DIR, 'tags.json'),
  versions: path.join(DATA_DIR, 'versions.json'),
};

/**
 * 读取 JSON 文件
 */
export async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 写入 JSON 文件
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 确保数据目录存在
 */
export async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
