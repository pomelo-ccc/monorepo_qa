import { Router, Request, Response } from 'express';
import { moduleService } from '../services';

const router = Router();

/**
 * GET /api/modules - 获取所有模块
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const modules = await moduleService.getAll();
    res.json(modules);
  } catch {
    res.status(500).json({ error: '获取模块列表失败' });
  }
});

/**
 * GET /api/modules/flat - 获取扁平化模块列表
 */
router.get('/flat', async (_req: Request, res: Response) => {
  try {
    const modules = await moduleService.getFlatList();
    res.json(modules);
  } catch {
    res.status(500).json({ error: '获取模块列表失败' });
  }
});

/**
 * GET /api/modules/:id - 获取单个模块
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const module = await moduleService.getById(req.params.id);
    if (module) {
      res.json(module);
    } else {
      res.status(404).json({ error: '模块不存在' });
    }
  } catch {
    res.status(500).json({ error: '获取模块失败' });
  }
});

/**
 * POST /api/modules - 创建顶级模块
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    const newModule = await moduleService.createParent({ id, name });
    res.status(201).json(newModule);
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建模块失败';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/modules/:parentId/children - 添加子模块
 */
router.post('/:parentId/children', async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }
    const updated = await moduleService.addChild(req.params.parentId, { id, name });
    if (updated) {
      res.status(201).json(updated);
    } else {
      res.status(404).json({ error: '父模块不存在' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '添加子模块失败';
    res.status(400).json({ error: message });
  }
});

/**
 * PUT /api/modules - 批量保存模块（用于排序、结构调整）
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    await moduleService.saveAll(req.body);
    res.json(req.body);
  } catch {
    res.status(500).json({ error: '保存模块失败' });
  }
});

/**
 * PUT /api/modules/:id - 更新模块名称
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;
    const updated = await moduleService.updateName(req.params.id, name, parentId);
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '模块不存在' });
    }
  } catch {
    res.status(500).json({ error: '更新模块失败' });
  }
});

/**
 * DELETE /api/modules/:parentId/children/:childId - 删除子模块
 */
router.delete('/:parentId/children/:childId', async (req: Request, res: Response) => {
  try {
    const deleted = await moduleService.deleteChild(req.params.parentId, req.params.childId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: '模块不存在' });
    }
  } catch {
    res.status(500).json({ error: '删除模块失败' });
  }
});

/**
 * DELETE /api/modules/:id - 删除顶级模块
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await moduleService.deleteParent(req.params.id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: '模块不存在' });
    }
  } catch {
    res.status(500).json({ error: '删除模块失败' });
  }
});

export default router;
