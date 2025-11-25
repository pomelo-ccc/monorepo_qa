import { Router, Request, Response } from 'express';
import { tagService } from '../services';

const router = Router();

/**
 * GET /api/tags - 获取所有标签
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const tags = await tagService.getAll();
    res.json(tags);
  } catch {
    res.status(500).json({ error: '获取标签列表失败' });
  }
});

/**
 * GET /api/tags/stats - 获取标签使用统计
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await tagService.getStats();
    res.json(stats);
  } catch {
    res.status(500).json({ error: '获取标签统计失败' });
  }
});

/**
 * POST /api/tags - 添加标签
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { tag } = req.body;
    if (!tag) {
      res.status(400).json({ error: '缺少标签名称' });
      return;
    }
    const tags = await tagService.add(tag);
    res.status(201).json(tags);
  } catch (err) {
    const message = err instanceof Error ? err.message : '添加标签失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/tags/batch - 批量添加标签
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { tags: newTags } = req.body;
    if (!newTags || !Array.isArray(newTags)) {
      res.status(400).json({ error: '参数格式错误' });
      return;
    }
    const tags = await tagService.addMany(newTags);
    res.status(201).json(tags);
  } catch {
    res.status(500).json({ error: '批量添加标签失败' });
  }
});

/**
 * PUT /api/tags/:oldTag - 更新标签名称
 */
router.put('/:oldTag', async (req: Request, res: Response) => {
  try {
    const oldTag = decodeURIComponent(req.params.oldTag);
    const { newTag } = req.body;

    if (!newTag) {
      res.status(400).json({ error: '缺少新标签名称' });
      return;
    }

    const tags = await tagService.update(oldTag, newTag);
    res.json(tags);
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新标签失败';
    res.status(400).json({ error: message });
  }
});

/**
 * DELETE /api/tags/:tag - 删除标签
 */
router.delete('/:tag', async (req: Request, res: Response) => {
  try {
    const tag = decodeURIComponent(req.params.tag);
    const tags = await tagService.delete(tag);
    res.json(tags);
  } catch {
    res.status(500).json({ error: '删除标签失败' });
  }
});

export default router;
