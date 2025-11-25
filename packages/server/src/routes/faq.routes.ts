import { Router, Request, Response } from 'express';
import { faqService } from '../services';

const router = Router();

/**
 * GET /api/faqs - 获取所有 FAQ
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const faqs = await faqService.getAll();
    res.json(faqs);
  } catch {
    res.status(500).json({ error: '获取 FAQ 列表失败' });
  }
});

/**
 * GET /api/faqs/search - 搜索 FAQ
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { keyword, component, tags, status } = req.query;
    const faqs = await faqService.search({
      keyword: keyword as string,
      component: component as string,
      tags: tags ? (tags as string).split(',') : undefined,
      status: status as string,
    });
    res.json(faqs);
  } catch {
    res.status(500).json({ error: '搜索失败' });
  }
});

/**
 * GET /api/faqs/:id - 获取单个 FAQ
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const faq = await faqService.getById(req.params.id);
    if (faq) {
      // 增加浏览量
      await faqService.incrementViews(req.params.id);
      res.json(faq);
    } else {
      res.status(404).json({ error: 'FAQ 不存在' });
    }
  } catch {
    res.status(500).json({ error: '获取 FAQ 失败' });
  }
});

/**
 * POST /api/faqs - 创建 FAQ
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const newFaq = await faqService.create(req.body);
    res.status(201).json(newFaq);
  } catch {
    res.status(500).json({ error: '创建 FAQ 失败' });
  }
});

/**
 * PUT /api/faqs/:id - 更新 FAQ
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await faqService.update(req.params.id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'FAQ 不存在' });
    }
  } catch {
    res.status(500).json({ error: '更新 FAQ 失败' });
  }
});

/**
 * DELETE /api/faqs/:id - 删除 FAQ
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await faqService.delete(req.params.id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'FAQ 不存在' });
    }
  } catch {
    res.status(500).json({ error: '删除 FAQ 失败' });
  }
});

/**
 * POST /api/faqs/:id/view - 增加浏览量
 */
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    await faqService.incrementViews(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: '更新浏览量失败' });
  }
});

export default router;
