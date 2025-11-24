// 预定义的模块配置
export const MODULES = {
    frontend: {
        id: 'frontend',
        name: '前端',
        children: [
            { id: 'project', name: '项目' },
            { id: 'table', name: 'Table' },
            { id: 'form', name: 'Form' },
            { id: 'other', name: '其他' }
        ]
    },
    backend: {
        id: 'backend',
        name: '后端',
        children: []
    }
};

// 预定义的标签
export const PREDEFINED_TAGS = [
    '校验',
    '异步',
    '表单提交',
    '动态表单',
    'FormArray',
    '数据绑定',
    '分页',
    '状态管理',
    'API',
    '构建',
    '依赖',
    'npm',
    '性能',
    '超时',
    '导出',
    'Select',
    '对象绑定',
    '回显',
    'VirtualScroll',
    'Performance',
    'Auth',
    'Interceptor',
    'CORS',
    'HTTP',
    '路由',
    '懒加载',
    '样式',
    'CSS',
    '响应式',
    '兼容性',
    '浏览器',
    '调试',
    '测试',
    '单元测试',
    'E2E',
    '优化',
    '打包',
    'Webpack',
    'Vite'
];

// 版本选项
export const VERSION_OPTIONS = [
    '1.0.x',
    '1.1.x',
    '1.2.x',
    '1.3.x',
    '2.0.x',
    '2.1.x',
    '3.0.x',
    'ALL',
    'N/A'
];

// 错误码生成规则
export function generateErrorCode(module: string, tags: string[]): string {
    const modulePrefix = module.toUpperCase().substring(0, 3);
    const tagPrefix = tags.length > 0 ? tags[0].substring(0, 3).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString().slice(-4);
    return `${modulePrefix}_${tagPrefix}_${timestamp}`;
}

// 错误码说明
export function getErrorCodeDescription(errorCode: string): string {
    const parts = errorCode.split('_');
    if (parts.length !== 3) return '自动生成的错误码';

    const [module, tag, timestamp] = parts;
    return `错误码格式说明：
  - 前缀 (${module}): 模块标识
  - 中间 (${tag}): 主要标签标识  
  - 后缀 (${timestamp}): 时间戳后4位
  
此错误码用于快速定位和追踪问题。`;
}
