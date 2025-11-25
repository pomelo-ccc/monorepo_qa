import { Router } from 'express';
import faqRoutes from './faq.routes';
import moduleRoutes from './module.routes';
import tagRoutes from './tag.routes';
import versionRoutes from './version.routes';
import fileRoutes from './file.routes';

const router = Router();

// 注册所有路由
router.use('/faqs', faqRoutes);
router.use('/modules', moduleRoutes);
router.use('/tags', tagRoutes);
router.use('/versions', versionRoutes);
router.use('/files', fileRoutes);

export default router;
