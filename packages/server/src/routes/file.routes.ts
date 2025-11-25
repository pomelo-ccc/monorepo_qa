import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fileService from '../services/file.service';

const router = Router();
const upload = multer({ dest: path.join(__dirname, '../../uploads/temp_raw') });

router.get('/', async (req, res) => {
  const files = await fileService.getFiles();
  res.json(files);
});

router.get('/check', async (req, res) => {
  const hash = req.query.hash as string;
  if (!hash) {
     return res.status(400).send('Hash is required');
  }
  const result = await fileService.checkFile(hash);
  res.json(result);
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { hash, index } = req.body;
    const file = req.file;
    if (!file || !hash || index === undefined) {
       return res.status(400).send('Missing parameters');
    }
    await fileService.saveChunk(file, hash, parseInt(index));
    res.json({ success: true });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

router.post('/merge', async (req, res) => {
  try {
    const { hash, filename, totalChunks, originalName, mimeType } = req.body;
    const file = await fileService.mergeChunks(hash, filename, parseInt(totalChunks), originalName, mimeType);
    res.json(file);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  await fileService.deleteFile(req.params.id);
  res.json({ success: true });
});

export default router;
