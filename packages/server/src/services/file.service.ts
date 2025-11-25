import * as fs from 'fs-extra';
import * as path from 'path';
import 'multer'; // Ensure Multer types are available
import * as crypto from 'crypto';
import { FileRecord } from '../models/file.model';

const DATA_FILE = path.join(__dirname, '../../data/files.json');
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// In-memory token store: token -> { fileId, expires }
const downloadTokens = new Map<string, { fileId: string; expires: number }>();

// Ensure directories exist
fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(TEMP_DIR);

export const getFiles = async (): Promise<FileRecord[]> => {
  if (!fs.existsSync(DATA_FILE)) {
    await fs.writeJSON(DATA_FILE, []);
  }
  return fs.readJSON(DATA_FILE);
};

export const getFile = async (id: string): Promise<FileRecord | undefined> => {
  const files = await getFiles();
  return files.find((f) => f.id === id);
};

export const checkFile = async (
  hash: string,
): Promise<{ exists: boolean; url?: string; chunks?: number[] }> => {
  const files = await getFiles();
  const file = files.find((f) => f.hash === hash);
  if (file) {
    return { exists: true, url: `/uploads/${file.filename}` };
  }

  const chunkDir = path.join(TEMP_DIR, hash);
  if (await fs.pathExists(chunkDir)) {
    const chunks = await fs.readdir(chunkDir);
    const chunkIndices = chunks.map((c) => parseInt(c, 10)).sort((a, b) => a - b);
    return { exists: false, chunks: chunkIndices };
  }

  return { exists: false, chunks: [] };
};

export const saveChunk = async (
  file: Express.Multer.File,
  hash: string,
  index: number,
): Promise<void> => {
  const chunkDir = path.join(TEMP_DIR, hash);
  await fs.ensureDir(chunkDir);
  await fs.move(file.path, path.join(chunkDir, index.toString()), { overwrite: true });
};

export const mergeChunks = async (
  hash: string,
  filename: string,
  totalChunks: number,
  originalName: string,
  mimeType: string,
): Promise<FileRecord> => {
  const chunkDir = path.join(TEMP_DIR, hash);
  const ext = path.extname(filename);
  // Use hash as filename to avoid duplicates and special characters issues
  const finalFilename = `${hash}${ext}`;
  const finalPath = path.join(UPLOAD_DIR, finalFilename);

  // If file already exists in uploads (but not in json for some reason), just use it
  if (!(await fs.pathExists(finalPath))) {
    // Create write stream
    const writeStream = fs.createWriteStream(finalPath);
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, i.toString());
      if (!(await fs.pathExists(chunkPath))) {
        throw new Error(`Missing chunk ${i}`);
      }
      const chunk = await fs.readFile(chunkPath);
      writeStream.write(chunk);
    }
    writeStream.end();

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Cleanup chunks
    await fs.remove(chunkDir);
  }

  // Create record
  const stats = await fs.stat(finalPath);
  const newFile: FileRecord = {
    id: Date.now().toString(),
    filename: finalFilename,
    originalName,
    size: stats.size,
    mimeType,
    path: `/uploads/${finalFilename}`,
    uploadTime: new Date().toISOString(),
    hash,
  };

  const files = await getFiles();
  files.push(newFile);
  await fs.writeJSON(DATA_FILE, files, { spaces: 2 });

  return newFile;
};

export const deleteFile = async (id: string): Promise<void> => {
  const files = await getFiles();
  const index = files.findIndex((f) => f.id === id);
  if (index === -1) return;

  const file = files[index];
  const filePath = path.join(UPLOAD_DIR, file.filename);
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
  }

  files.splice(index, 1);
  await fs.writeJSON(DATA_FILE, files, { spaces: 2 });
};

export const generateDownloadToken = (fileId: string): string => {
  const token = crypto.randomUUID();
  // Token valid for 5 minutes
  const expires = Date.now() + 5 * 60 * 1000;
  downloadTokens.set(token, { fileId, expires });

  // Clean up expired tokens occasionally
  if (downloadTokens.size > 1000) {
    const now = Date.now();
    for (const [t, data] of downloadTokens.entries()) {
      if (data.expires < now) {
        downloadTokens.delete(t);
      }
    }
  }

  return token;
};

export const verifyDownloadToken = (token: string): string | null => {
  const data = downloadTokens.get(token);
  if (!data) return null;

  if (Date.now() > data.expires) {
    downloadTokens.delete(token);
    return null;
  }

  return data.fileId;
};

export const getFilePathById = async (
  id: string,
): Promise<{ absolutePath: string; filename: string } | null> => {
  const file = await getFile(id);
  if (!file) return null;
  return {
    absolutePath: path.join(UPLOAD_DIR, file.filename),
    filename: file.originalName,
  };
};
