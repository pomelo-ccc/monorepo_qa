import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FaqItem } from './models/faq.model';

const app = express();
const PORT = 3000;
// Assuming dist/main.js is running, data is in ../data/faqs.json relative to dist, or ../../data relative to src?
// If running from packages/server, process.cwd() might be packages/server.
// Let's use path relative to __dirname.
// If compiled to dist/main.js, __dirname is dist. data is in data/ (sibling to dist).
const DATA_FILE = path.join(__dirname, '../data/faqs.json');

app.use(cors());
app.use(bodyParser.json());

// Helper to read data
async function getFaqs(): Promise<FaqItem[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return [];
  }
}

// Helper to write data
async function saveFaqs(faqs: FaqItem[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(faqs, null, 2));
}

// Initialize
(async () => {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // Write initial data if file doesn't exist
      const initialData: FaqItem[] = [
        {
          id: 'form-async-validation',
          title: '[Form] 异步校验失败后仍可提交表单',
          component: 'Form',
          version: '1.2.x',
          tags: ['校验', '异步', '表单提交'],
          errorCode: 'ASYNC_VALIDATE_FAIL',
          summary: '异步验证器返回错误状态后，提交按钮未被禁用，用户仍可提交错误数据。',
          phenomenon: '复现步骤：\n1. 创建一个带有异步验证器（如检查用户名唯一性）的表单字段。\n2. 输入触发验证错误的值。\n3. 错误信息显示，但提交按钮仍然可用。\n4. 点击提交，无效数据被发送。',
          solution: '根本原因通常是验证器状态更新处理不当。修复方法是结合 `asyncValidators` 使用 `updateValueAndValidity()` 方法，并根据表单整体的 `status` 属性（PENDING/VALID/INVALID）来控制提交按钮的禁用状态，而不仅仅是检查 `valid` 属性。',
          troubleshootingFlow: 'graph TD; A[开始] --> B{表单提交?}; B --> C{表单状态是 PENDING?}; C -- 是 --> D[禁用提交按钮]; D --> E{等待异步校验完成}; E --> F{表单状态是 VALID?}; F -- 是 --> G[启用按钮 & 允许提交]; F -- 否 --> H[保持禁用, 显示错误]; C -- 否 --> F;',
          validationMethod: '验证异步校验失败后，提交按钮变为禁用状态，直到字段值修正并通过校验。',
          views: 128,
          solveTimeMinutes: 10
        }
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (e) {
    console.error('Failed to initialize data directory', e);
  }
})();

// Routes
app.get('/api/faqs', async (req, res) => {
  const faqs = await getFaqs();
  res.json(faqs);
});

app.get('/api/faqs/:id', async (req, res) => {
  const faqs = await getFaqs();
  const item = faqs.find((f: FaqItem) => f.id === req.params.id);
  if (item) res.json(item);
  else res.status(404).send('Not found');
});

app.post('/api/faqs', async (req, res) => {
  const faqs = await getFaqs();
  const newItem: FaqItem = { ...req.body, id: req.body.id || Date.now().toString() };
  faqs.unshift(newItem);
  await saveFaqs(faqs);
  res.status(201).json(newItem);
});

app.put('/api/faqs/:id', async (req, res) => {
  const faqs = await getFaqs();
  const index = faqs.findIndex((f: FaqItem) => f.id === req.params.id);
  if (index !== -1) {
    faqs[index] = { ...faqs[index], ...req.body };
    await saveFaqs(faqs);
    res.json(faqs[index]);
  } else {
    res.status(404).send('Not found');
  }
});

app.delete('/api/faqs/:id', async (req, res) => {
  let faqs = await getFaqs();
  faqs = faqs.filter((f: FaqItem) => f.id !== req.params.id);
  await saveFaqs(faqs);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
