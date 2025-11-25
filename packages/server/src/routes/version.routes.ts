import { Router, Request, Response } from 'express';
import { versionService } from '../services';

const router = Router();

/**
 * GET /api/versions - 获取所有版本
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const versions = await versionService.getAll();
    res.json(versions);
  } catch {
    res.status(500).json({ error: '获取版本列表失败' });
  }
});

/**
 * POST /api/versions - 添加版本
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: '缺少版本名称' });
      return;
    }
    const version = await versionService.add({ name, description });
    res.status(201).json(version);
  } catch (err) {
    const message = err instanceof Error ? err.message : '添加版本失败';
    res.status(400).json({ error: message });
  }
});

/**
 * PUT /api/versions/:id - 更新版本
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await versionService.update(req.params.id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: '版本不存在' });
    }
  } catch {
    res.status(500).json({ error: '更新版本失败' });
  }
});

/**
 * DELETE /api/versions/:id - 删除版本
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await versionService.delete(req.params.id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: '版本不存在' });
    }
  } catch {
    res.status(500).json({ error: '删除版本失败' });
  }
});

export default router;
