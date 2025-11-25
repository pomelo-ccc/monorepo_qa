import express from 'express';
import cors from 'cors';
import routes from './routes';
import { ensureDataDir } from './utils/file.util';
import { versionService } from './services';

import * as path from 'path';

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 初始化数据目录和默认数据
async function initialize() {
  try {
    await ensureDataDir();
    await versionService.initDefault();
    console.log('✓ 数据目录初始化完成');
  } catch (error) {
    console.error('✗ 数据目录初始化失败:', error);
  }
}

// 启动服务器
initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   FAQ Server 已启动                         ║
║   地址: http://localhost:${PORT}              ║
╚════════════════════════════════════════════╝

API 端点:
  GET    /api/faqs           - 获取所有 FAQ
  GET    /api/faqs/:id       - 获取单个 FAQ
  POST   /api/faqs           - 创建 FAQ
  PUT    /api/faqs/:id       - 更新 FAQ
  DELETE /api/faqs/:id       - 删除 FAQ

  GET    /api/modules        - 获取所有模块
  GET    /api/modules/flat   - 获取扁平化模块列表
  POST   /api/modules        - 创建顶级模块
  PUT    /api/modules        - 批量保存模块
  DELETE /api/modules/:id    - 删除模块

  GET    /api/tags           - 获取所有标签
  GET    /api/tags/stats     - 获取标签统计
  POST   /api/tags           - 添加标签
  PUT    /api/tags/:oldTag   - 更新标签
  DELETE /api/tags/:tag      - 删除标签

  GET    /api/versions       - 获取所有版本
  POST   /api/versions       - 添加版本
  PUT    /api/versions/:id   - 更新版本
  DELETE /api/versions/:id   - 删除版本
`);
  });
});
